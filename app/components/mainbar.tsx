import React from 'react'
import Home from '../pages/home'
import Profile from '../pages/profile'
import Settings from '../pages/settings'
import Test from '../pages/test'
import Practice from '../pages/practice'

const MainBar = ({ selectedPage }: { selectedPage: string }) => {
  return (
    <div className="p-4 space-y-4 text-black">
      {selectedPage === 'home' && <Home />}
      {selectedPage === 'profile' && <Profile />}
      {selectedPage === 'settings' && <Settings />}
      {selectedPage === 'tests' && <Test />}
      {selectedPage === 'practices' && <Practice />}
    </div>
  )
}

export default MainBar
