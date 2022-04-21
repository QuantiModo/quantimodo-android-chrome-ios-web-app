/**
* Update a {@link Me}'s state by randomly combining a color and an animal. Ex: "teal_seal"
* @module chat-engine-random-username
*/
const randomName = () => {

    // list of friendly animals
    let animals = ['pigeon', 'seagull', 'bat', 'owl', 'sparrows', 'robin', 'bluebird', 'cardinal', 'hawk', 'fish', 'shrimp', 'frog', 'whale', 'shark', 'eel', 'seal', 'lobster', 'octopus', 'mole', 'shrew', 'rabbit', 'chipmunk', 'armadillo', 'dog', 'cat', 'lynx', 'mouse', 'lion', 'moose', 'horse', 'deer', 'raccoon', 'zebra', 'goat', 'cow', 'pig', 'tiger', 'wolf', 'pony', 'antelope', 'buffalo', 'camel', 'donkey', 'elk', 'fox', 'monkey', 'gazelle', 'impala', 'jaguar', 'leopard', 'lemur', 'yak', 'elephant', 'giraffe', 'hippopotamus', 'rhinoceros', 'grizzlybear'];

    // list of friendly colors
    let colors = ['silver', 'gray', 'black', 'red', 'maroon', 'olive', 'lime', 'green', 'teal', 'blue', 'navy', 'fuchsia', 'purple'];

    // randomly generate a combo of the two and return it
    return colors[Math.floor(Math.random() * colors.length)] + '_' + animals[Math.floor(Math.random() * animals.length)];

}

/**
* @function
*/
module.exports = () => {

    class extension {

        construct () {

            let state = this.parent.state;

            /**
            @member state"."username
            @ceextends User
            */
            state.username = randomName();

            this.parent.update(state);
        }

    };

    // define both the extended methods and the middleware in our plugin
    return {
        namespace: 'random-username',
        extends: {
            Me: extension
        }
    }

}
