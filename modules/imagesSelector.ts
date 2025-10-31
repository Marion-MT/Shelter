export function getImageByType(type : string){
    switch(type) {
        case 'CS' :
            return require('../assets/icon-general.png');
        case 'Exp' :
        case 'Gra' :
            return require('../assets/icon-expedition.png');
        case 'Vis' :
            return require('../assets/icon-visit.png');
        case 'Ch' :
            return require('../assets/icon-dog.png');
        case 'Ra' :
            return require('../assets/icon-radio.png');
        case 'Hl' :
            return require('../assets/icon-unexpected.png');
        default:
            return require('../assets/icon-general.png');
            
    }
}