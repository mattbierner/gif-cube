export const debug = location.host === 'localhost:4000' || location.host === 'imac.local:4000';

if (debug) {
    console.log('In debug mode')
}

export const orderEndpoint = debug
    ? 'http://localhost:7071/api/Order/'
    : 'https://gifcubeapi.azurewebsites.net/api/Order?code=0SOhaZisRAax8r4PEAhTtb2FGUW7waDA4OLfmXU/ZnpxxGrC9vikFQ=='

export const stipePublicKey = debug
    ? 'pk_test_bIGBcXHLgnKXqQRjhQYMkOhK'
    : 'pk_live_D9OaQqg0bo7v2lksmh3PcaWq';


/**
 * Minimum aspect ratio of a cube that can be ordered
 */
export const minAspectRatio = 0.3