local overseer = require('overseer')

overseer.register_template({
  name = 'update',
  builder = function()
    return {
      name = 'update',
      cmd = 'sh ./update.sh',
      components = {
        'default',
      },
    }
  end
})
