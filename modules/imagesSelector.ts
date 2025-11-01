export function getImage(type : string){

    switch(type) {
        case 'alcool' :
            return require('../assets/pictures/icon-alcool.png');
        case 'attack' :
            return require('../assets/pictures/icon-attack.png');
        case 'bag' :
            return require('../assets/pictures/icon-bag.png');
        case 'badguy' :
            return require('../assets/pictures/icon-badguy.png');
        case 'cans' :
            return require('../assets/pictures/icon-cans.png');
        case 'city' :
            return require('../assets/pictures/icon-city.png');
        case 'depress' :
            return require('../assets/pictures/icon-depress.png');
        case 'dog' :
            return require('../assets/pictures/icon-dog.png');
        case 'expedition' :    
            return require('../assets/pictures/icon-expedition.png');
        case 'fight' :    
            return require('../assets/pictures/icon-fight.png');
        case 'foraging' :    
            return require('../assets/pictures/icon-foraging.png');
        case 'general' :
            return require('../assets/pictures/icon-general.png');
        case 'gift' :
            return require('../assets/pictures/icon-gift.png');
        case 'group' :    
            return require('../assets/pictures/icon-group.png');
        case 'hospital' :
            return require('../assets/pictures/icon-hospital.png');
        case 'house' :    
            return require('../assets/pictures/icon-house.png');
        case 'musician' :
            return require('../assets/pictures/icon-musician.png');
        case 'night' :
            return require('../assets/pictures/icon-night.png');
        case 'outside' :
            return require('../assets/pictures/icon-night.png');
        case 'radio' :
            return require('../assets/pictures/icon-radio.png');
        case 'radioactive' :
            return require('../assets/pictures/icon-radioactive.png');
        case 'rat' :
            return require('../assets/pictures/icon-rat.png');
        case 'shadow' :
            return require('../assets/pictures/icon-shadow.png');
        case 'tools' :
            return require('../assets/pictures/icon-tools.png');
        case 'man' :
            return require('../assets/pictures/icon-man.png');
        case 'visit' :
            return require('../assets/pictures/icon-visit.png');
        case 'warehouse' :
            return require('../assets/pictures/icon-warehouse.png');
        case 'woman' :
            return require('../assets/pictures/icon-woman.png');
        case 'weapon' :
            return require('../assets/pictures/icon-weapon.png');
        case 'drugs' :
            return require('../assets/pictures/icon-drugs.png');
        default:
            return require('../assets/pictures/icon-general.png');
            
    }
}