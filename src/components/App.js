import React, { Component } from 'react';
import Meme from '../abis/Meme.json'
import Web3 from 'web3';
import './App.css';

// Warning: Use older version of ipfs-http-client, install it with:
// npm install ipfs-http-client@33.1.1
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {

    const web3 = window.web3

    //load accounts, fetch account's ETH balance
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    // fetch the '5777' value
    const networdId = await web3.eth.net.getId()

    // Load Meme smart contract
    const networkData = Meme.networks[networdId]
    if(networkData){
      const meme = new web3.eth.Contract(Meme.abi, networkData.address)
      this.setState({ meme })

      let memeHash = await meme.methods.get().call()
      this.setState({ memeHash })
    }else{
      window.alert('Color contract not deployed to detected network.')
    }

    this.setState({ loading:false })
  }

  constructor (props) {
    super(props);
    this.state = {
      account: '',
      loading: true,
      meme: {},
      buffer: null,
      memeHash:''
    }
  }

  captureFile = (event) => {
    event.preventDefault()
    // Process file for IPFS
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
    }
  }

  onSubmit = async (event) => {
    event.preventDefault()
    await ipfs.add(this.state.buffer, (error, result) => {
         console.log('IPFS result', result)
         const memeHash = result[0].hash
          if(error) {
             console.error(error)
             return
          }
    // Step 2: store file (i.e. this hash) on blockchain
          this.state.meme.methods.set(memeHash).send({from: this.state.account})
          .then((receipt) => {
            this.setState({ memeHash })
        });
     })
  }

  render() {
    let content
    if (this.state.loading) {
      content = <p id="loader" className="text-center"> Loading... </p>
    } else {
      content = 
      <div className="content mr-auto ml-auto">
      
      {this.state.memeHash === ''
      ? <div></div>
      : 
      <div className="card mx-auto" style={{width: 300}}>
      <img src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} width="200" alt="Your Meme!" className="card mx-auto mt-3" />
        <div className="card-body">
          <h5 className="card-title">Your Meme</h5>
          <p className="card-text">Upload another photo to change it!</p>
        </div>
      </div>
      }

      <hr/>
      <br/>
      <p>Meme's hash: {this.state.memeHash}</p>

      <form onSubmit={this.onSubmit}>
          <input type="file" onChange={this.captureFile}/>
          <input type="submit" value="Add my meme!" className="btn btn-success" />
      </form>
      
    </div>
    }


    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meme of the Day
          </a>

            <div>
                <ul className="navbar-nav px-3">
                    <li className="nav-item flex-nowrap d-none d-sm-none d-sm-block">
                        <small className="text-white">
                            Your account: {this.state.account}
                        </small>
                    </li>
                </ul>
            </div>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              {content}
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
