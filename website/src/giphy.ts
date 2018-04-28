export const getGiphy = () =>
    require('giphy-api')({
        https: true,
        apiKey: 'dc6zaTOxFJmzC'
    });