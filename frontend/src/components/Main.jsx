import {BrowserRouter, Routes, Route} from 'react-router-dom'
import React from 'react'
import Home from './Home'
import OnchainScore from './OnchainScore'

const Main = () => {
  return (
    <>
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onchain-score/:walletAddress" element={<OnchainScore />} />
        </Routes>
    </BrowserRouter>
</>
  )
}

export default Main