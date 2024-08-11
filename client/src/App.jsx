
import React, { useContext } from 'react'
import axios from 'axios'
import Camera from './components/Camera'
import { UserContext } from './components/UserContext'
import Cards from './components/Cards'


const App = () => {

  const {uploadedFileURL} = useContext(UserContext)

  const [size, setSize] = React.useState('-')
  const [height, setHeight] = React.useState(0)
  const [weight, setWeight] = React.useState(0)
  const [age, setAge] = React.useState(0)

  const [colorTone, setColorTone] = React.useState('-')
  const [p_age, setp_Age] = React.useState(0)
  const [gender,setGender] = React.useState('-')

  const handlePredict = async () => {
    await axios.post('http://127.0.0.1:5000/predict_size', {
      height,weight,age
    }).then((response) => {
      console.log(response.data.predicted_size)
      setSize(response.data.predicted_size)
    })
    
    const image_path = uploadedFileURL
    await axios.post('http://127.0.0.1:5000/predict_skin_tone', {
      image_path
    }).then((response) => {
      console.log(response.data.predicted_skin_tone)
      setColorTone(response.data.predicted_skin_tone)
    }) 
    
    await axios.post('http://127.0.0.1:5000/predict_gender_age', {
      image_path
    }).then((response) => {
      console.log(response.data[0].gender)
      setGender(response.data[0].gender)
    })

  }

  return (
    <div className='bg-dark' style={{height:'100vh', width:'100vw', color:'white'}}>
      <h2 className='d-flex justify-content-center pt-4'>Wallmart Cloths Recommendation</h2>
      <div className="row d-flex justify-content-center align-items-center px-4" style={{height:'90vh'}}>
        <div className="col-md-6" style={{borderRight:'1px solid white'}}>
          <Camera />
          <div className='mt-3' style={{width:'500px'}}>
              <h6>CalculateSize</h6>
              <div className="d-flex" style={{width:'500px'}}>
                  <input type="text" className='mx-1 form-control bg-dark' style={{fontWeight: 600, color: 'white'}} name="" placeholder='Age(yr)' id="" onChange={(e)=>setAge(e.target.value)} />
                  <input type="text" className='mx-1 form-control bg-dark' style={{fontWeight: 600, color: 'white'}} name="" placeholder='Weight(kg)' id="" onChange={(e)=>setWeight(e.target.value)} />
                  <input type="text" className='mx-1 form-control bg-dark' style={{fontWeight: 600, color: 'white'}} name="" placeholder='Height(cm)' id="" onChange={(e)=>setHeight(e.target.value)} />
              </div>
              <button className="btn btn-outline-primary btn-sm mt-3" style={{width: '100%'}} onClick={handlePredict}>Predict</button>
          </div>
        </div>
        <div className="col-md-4" style={{paddingLeft: '120px'}}>
          <h4>Recommendations : <span style={{marginLeft: '78px'}}><button className="btn-outline-light btn-sm btn">How do I look?</button></span></h4>
          <hr style={{height: '2px', backgroundColor: 'white'}} />          
          <div className="" style={{fontWeight: 600, color: 'white'}}>
            <div className="d-flex justify-content-between">
              Color Tone: <span>{colorTone}</span>
            </div>
            {/* <hr style={{height: '1px', backgroundColor: 'white'}} />
            <div className="d-flex justify-content-between">
              Age: <span>White</span>
            </div> */}
            <hr style={{height: '1px', backgroundColor: 'white'}} />
            <div className="d-flex justify-content-between">
              Gender: <span>{gender}</span>
            </div>
            <hr style={{height: '1px', backgroundColor: 'white'}} />
            <div className="d-flex justify-content-between">
              Size: <span>{size}</span>
            </div>
            <hr style={{height: '1px', backgroundColor: 'white'}} />
            <div className="d-flex justify-content-between">
              Recommended colors: <span>White, purple, green</span>
            </div>
            <hr style={{height: '1px', backgroundColor: 'white'}} />
            <div className="d-flex flex-column">
              <div className="">Recommended Products:</div>
              <div className='border no-scroll d-flex flex-column align-items-center' style={{borderRadius: '10px', padding: '10px', marginTop: '10px', height: '400px', overflow: 'scroll'}}>
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
                <Cards />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App