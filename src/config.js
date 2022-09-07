const config = {
  url: '',
  appID: '',
  userID: '',
  vue: {
    Vue: null,
    router: null
  }
}

function setConfig(options) {
  for (const key in config) {
    if (options[key]) {
      config[key] = options[key]
    }
  }
}

export { config, setConfig }
