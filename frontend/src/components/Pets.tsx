import * as React from 'react'
import { History } from 'history'
import update from 'immutability-helper'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { create, deletePet, get, patch } from '../api/pet-api'
import Auth from '../auth/Auth'
import { Todo as Pet } from '../types/Todo'

interface PetsProps {
  auth: Auth
  history: History
}

interface PetsState {
  pets: Pet[]
  newTodoName: string
  loadingPets: boolean
}

export class Pets extends React.PureComponent<PetsProps, PetsState> {
  state: PetsState = {
    pets: [],
    newTodoName: '',
    loadingPets: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onEditButtonClick = (petId: string) => {
    this.props.history.push(`/pets/${petId}/edit`)
  }

  onPetCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const createdAt = new Date().toISOString()
      const newTodo = await create(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate,
        createdAt,
        done: false
      })
      this.setState({
        pets: [...this.state.pets, newTodo],
      })
    } catch {
      alert('Todo creation failed')
    }
  }

  onPetDelete = async (petId: string) => {
    try {
      await deletePet(this.props.auth.getIdToken(), petId)
      this.setState({
        pets: this.state.pets.filter(todo => todo.petId !== petId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onPetCheck = async (pos: number) => {
    try {
      const todo = this.state.pets[pos]
      await patch(this.props.auth.getIdToken(), todo.petId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        pets: update(this.state.pets, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await get(this.props.auth.getIdToken())
      this.setState({
        pets: todos,
        loadingPets: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Never forget your pet care anymore !1!1!11!</Header>
        {this.renderCreateTodoInput()}
        <small>We will send you a email !!</small>
        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Create Pet Task !!',
              onClick: this.onPetCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Write a short description"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingPets) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.pets.map((pet, pos) => {
          return (
            <Grid.Row key={pet.petId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onPetCheck(pos)}
                  checked={pet.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {pet.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {pet.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(pet.petId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onPetDelete(pet.petId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {pet.attachmentUrl && (
                <Image src={pet.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return date.toISOString()
  }
}
