// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Meme {
    
    string memeHash;
   
    function set(string memory _memeHash) public {
        memeHash = _memeHash;
    }
    
    function get() public view returns (string memory) {
        return memeHash;
    }
    
}