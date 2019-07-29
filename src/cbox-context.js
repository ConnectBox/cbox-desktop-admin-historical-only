import React from 'react'

const CboxContext = React.createContext({})

const CboxContextProvider = (props) => {
  const {scope, children} = props
  return (
    <CboxContext.Provider value={scope}>
      {children}
    </CboxContext.Provider>
  )
}

export { CboxContext, CboxContextProvider }
