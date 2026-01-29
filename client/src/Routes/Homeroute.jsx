import Categoriessection from '@/Components/Pages/Shop/Categoriessection'
import ProductSection from '@/Components/Pages/Homepage/Productsection/Productsection'
import React from 'react'
import Banner from '@/Components/Pages/Homepage/Banner/Banner'

const Homeroute = () => {
  return (
    <div>
      <Banner/>
      <Categoriessection/>
      <ProductSection/>
    </div>
  )
}

export default Homeroute
