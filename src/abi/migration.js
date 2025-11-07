export const MIGRATION_ABI = [
  // Custom errors (needed for viem to decode revert reasons)
  {
    type: 'error',
    name: 'ETHTransferFailed',
    inputs: []
  },
  {
    type: 'error',
    name: 'InsufficientETHBalance',
    inputs: [
      { name: 'required', type: 'uint256' },
      { name: 'available', type: 'uint256' }
    ]
  },
  {
    type: 'error',
    name: 'InsufficientTokenBBalance',
    inputs: [
      { name: 'required', type: 'uint256' },
      { name: 'available', type: 'uint256' }
    ]
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [{ name: 'owner', type: 'address' }]
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [{ name: 'account', type: 'address' }]
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [{ name: 'token', type: 'address' }]
  },
  {
    type: 'error',
    name: 'TokensMustDiffer',
    inputs: []
  },
  {
    type: 'error',
    name: 'ZeroAddress',
    inputs: []
  },
  {
    type: 'error',
    name: 'ZeroAmount',
    inputs: []
  },
  {
    type: 'function',
    name: 'tokenA',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    type: 'function',
    name: 'tokenB',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    type: 'function',
    name: 'contractBalances',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'tokenABalance', type: 'uint256' },
      { name: 'tokenBBalance', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'migrate',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: []
  }
]


