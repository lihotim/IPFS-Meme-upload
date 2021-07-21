const { assert } = require('chai');

const Meme = artifacts.require("Meme");

require('chai')
.use(require('chai-as-promised'))
.should()

contract('Meme', (accounts) => {

    let meme

    before(async () => {
        meme = await Meme.deployed()
    })

    describe('deployment', async() => {
        it('deploys successfully', async () => {
            const address = meme.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
    })

    describe('storage', async () => {
        it('can set memehash to another string', async () => {
            let memehash = 'Sarara'
            await meme.set(memehash)
            const result = await meme.get()
            assert.equal(result, memehash)
        })
    })

})