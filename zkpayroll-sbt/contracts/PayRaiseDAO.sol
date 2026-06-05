// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PayRaiseDAO {
    mapping(address => bool) public voters;
    mapping(uint256 => uint256) public yesVotes;
    mapping(uint256 => bool) public approved;

    uint256 public constant VOTE_THRESHOLD = 2;

    constructor(address[] memory _voters) {
        for (uint i = 0; i < _voters.length; i++) {
            voters[_voters[i]] = true;
        }
    }

    function voteApprove(uint256 year) external {
        require(voters[msg.sender], "Not DAO voter");
        require(!approved[year], "Already approved");

        yesVotes[year]++;

        if (yesVotes[year] >= VOTE_THRESHOLD) {
            approved[year] = true;
        }
    }

    function isApproved(uint256 year) external view returns (bool) {
        return approved[year];
    }
}
