db = db.getSiblingDB('myapp')

db.createUser({
  user: 'stan',
  pwd: 'stan',
  roles: [{ role: 'dbOwner', db: 'myapp' }],
})
