export default {
  type: "object",
  properties: {
    name: { type: 'string' },
    done: { type: 'boolean' },
    dueDate: { type: 'string', pattern: `^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$`},
  },
  required: ['name', 'done', 'dueDate']
} as const;
