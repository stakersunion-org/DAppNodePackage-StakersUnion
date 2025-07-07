# Welcome to the Stakers Union DAppNode Package!

This package is used to verify the operation of a DAppNode for the [Stakers Union](https://stakersunion.com). You must first have submitted an eligible address and received notification of approval. [Apply Now](https://stakersunion.com/apply)!

## What This Package Does

You can view the source code for this package [here](https://github.com/stakersunion-org/DAppNodePackage-StakersUnion/).

This package does the following:

- Requests entry of your ELIGIBLE_ADDRESS
- Requests your DAppNode PUBKEY to ensure uniqueness of submission
- Requests the number of validators running on your DAppNode to ensure that at least one validator is running using the Web3Signer endpoint
- Requests the execution client and consensus client to ensure that they are running using the DAppNode environment variables
- Submits collected information to the Stakers Union API

## How to Use

Make sure your ELIGIBLE_ADDRESS is set to your approved Stakers Union address and **[launch the UI](http://stakersunion.stakersunion.public.dappnode/)**.
