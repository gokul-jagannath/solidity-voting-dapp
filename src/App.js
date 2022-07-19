import { ethers } from "ethers";
import { useEffect, useState } from "react";

import {
  SmartContractABI,
  SmartContractAddress,
} from "./contracts/contractsIds";

function App() {
  const [haveMetamask, sethaveMetamask] = useState(true);
  const [accountAddress, setAccountAddress] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [votingContract, setVotingContract] = useState(null);

  const [candidate1, setCandidate1] = useState(null);
  const [candidate2, setCandidate2] = useState(null);

  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  useEffect(() => {
    const { ethereum } = window;
    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      sethaveMetamask(true);
    };
    checkMetamaskAvailability();
  }, []);

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      let balance = await provider.getBalance(accounts[0]);
      let bal = ethers.utils.formatEther(balance);
      setAccountAddress(accounts[0]);
      setAccountBalance(bal);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const getCandidate = async (id) => {
    const res = await votingContract.candidates(id);
    console.log(res);
    const candidateData = {
      id: res.id.toNumber(),
      name: res.name,
      voteCount: res.voteCount,
    };
    if (id === 1) {
      setCandidate1(candidateData);
    } else if (id === 2) {
      setCandidate2(candidateData);
    }
  };

  const handleVote = async (id) => {
    // Signer
    const signer = provider.getSigner();
    // Contract
    const newvotingContract = new ethers.Contract(
      SmartContractAddress,
      SmartContractABI,
      signer
    );
    const res = await newvotingContract.vote(id);
    console.log(res);
  };

  useEffect(() => {
    if (haveMetamask) {
      const fetchedContract = new ethers.Contract(
        SmartContractAddress,
        SmartContractABI,
        provider
      );

      console.log(fetchedContract);

      setVotingContract(fetchedContract);
    }
  }, [haveMetamask]);

  useEffect(() => {
    if (votingContract) {
      getCandidate(1);
      getCandidate(2);
    }
  }, [votingContract]);

  return (
    <div className="App">
      <header className="App-header">
        {haveMetamask ? (
          <div className="App-header">
            {isConnected && (
              <div className="card">
                <div className="card-row">
                  <h3>Wallet Address:</h3>
                  <p>
                    {accountAddress.slice(0, 4)}...
                    {accountAddress.slice(38, 42)}
                  </p>
                </div>

                <div>
                  <table>
                    <tr>
                      <th>Name</th>
                      <td>{candidate1.name}</td>
                      <td>{candidate2.name}</td>
                    </tr>
                    <tr>
                      <th>Votes received</th>
                      <td>{candidate1.voteCount.toNumber()}</td>
                      <td>{candidate2.voteCount.toNumber()}</td>
                    </tr>
                    <tr>
                      <th></th>
                      <td>
                        <button
                          className="vote-btn"
                          onClick={() => handleVote(1)}
                        >
                          Submit vote
                        </button>
                      </td>
                      <td>
                        <button
                          className="vote-btn"
                          onClick={() => handleVote(2)}
                        >
                          Submit vote
                        </button>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            )}
            {!isConnected && (
              <button className="btn" onClick={connectWallet}>
                Connect wallet
              </button>
            )}
          </div>
        ) : (
          <p>Please Install MataMask</p>
        )}
      </header>
    </div>
  );
}

export default App;
