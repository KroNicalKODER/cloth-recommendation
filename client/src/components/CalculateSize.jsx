import React from 'react'

const CalculateSize = () => {
  return (
    <div className='mt-3' style={{width:'500px'}}>
        <h6>CalculateSize</h6>
        <div className="d-flex" style={{width:'500px'}}>
            <input type="text" className='mx-1 form-control bg-dark' style={{fontWeight: 600, color: 'white'}} name="" placeholder='Age(yr)' id="" />
            <input type="text" className='mx-1 form-control bg-dark' style={{fontWeight: 600, color: 'white'}} name="" placeholder='Weight(kg)' id="" />
            <input type="text" className='mx-1 form-control bg-dark' style={{fontWeight: 600, color: 'white'}} name="" placeholder='Height(cm)' id="" />
        </div>
    </div>
  )
}

export default CalculateSize