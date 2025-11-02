import { StyleSheet, Image, View, Text } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";

import { getImage } from '../modules/imagesSelector';


type AchievementProps = {
  image: String;
  name: String;
  description: String;
  isUnlocked: boolean;
};

export default function Achievement({ image, name, description, isUnlocked } : AchievementProps) {

     return (
        <View style={[styles.achievementContainer, isUnlocked ? styles.unlockedAchievement : styles.lockedAchievement]} >
            <View style={styles.imageContainer}>
                {isUnlocked ? <Image style={styles.image} source={getImage(image)}/> : 
                <FontAwesome
                style={styles.unlockIcon}
                name='lock'
                size={50}
                color={'#352c2bb0'}
            />}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.description}>{description}</Text>
          </View>
        </View>
      );
}

const styles = StyleSheet.create({
    achievementContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '90%',
        borderRadius: 10,
        paddingVertical: 15,
        paddingRight: 5,
        paddingLeft: 10,
        gap: 10
    },
    imageContainer:{
        width: 60,
        height: 60,
    },
    image:{
        width: '100%',
        height: '100%',
    },
    unlockIcon:{
        textAlign: "center",
        marginTop: 5
    },
    achievementText: {
        fontSize: 20,
        fontFamily: 'ArialRounded',
        color: '#EFDAB7',
    },
   lockedAchievement :{  
        backgroundColor: '#efdab769',
   },
   unlockedAchievement :{
        backgroundColor: '#EFDAB7',
   },
     textContainer: {
        flex: 1,
  },name:{
        color:'#554946',
        fontSize:18,
        textAlign: 'left', 
        textTransform: 'capitalize',
        fontFamily: 'ArialRounded',
        
  },
  description:{
        color:'#554946',
        fontSize: 14,
        alignItems: 'flex-start',
        width: '100%',
        textAlign: 'left', 

  },
});