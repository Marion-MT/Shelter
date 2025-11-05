import { View, Text, TouchableOpacity, StyleSheet,Image, ImageBackground } from "react-native"
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useSelector } from "react-redux";
import { fetchWithAuth } from "../components/fetchWithAuth";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScrollView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import Achievement from '../components/Achievement'

import AudioManager from '../modules/audioManager';

import { getImage } from '../modules/imagesSelector';

type SuccesScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

type achievements = {
    name: string;
    description: string;
    image: string;
}

type TopPlayer = {
    bestScore: number,
    username: string,
}

const BACKEND_ADDRESS = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;

export default function SuccesScreen({ navigation }: SuccesScreenProps ) {
    const user = useSelector((state: string) => state.user.value);
    const [succesData, setSuccesData] = useState<achievements[]>([]);
    const [unlockedAchievement, setUnlockedAchievement] = useState<achievements[]>([]);
    const [activeTab, setActiveTab] = useState<'personnal'| 'leaderboard'>('leaderboard');
    const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([])


    useEffect(()=>{
        //fetch des succès
        fetch(`${BACKEND_ADDRESS}/achievements`)
        .then(response => response.json())
        .then(data => {
            //console.log(data)
            setSuccesData(data.achievements)
        })
        .catch(err => console.error('Erreur fetch succes', err))

        //fetch top players
        fetchWithAuth(`/users/topScores`, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data=>{
            //console.log('topscore====>',data)
            setTopPlayers(data.topScores)
            //console.log('TopPlayer', topPlayers)
        })
        .catch(err=>console.error('Erreur fetch Top Players', err))

        //fetch unlockedAchievements
        fetchWithAuth(`/users/unlockedAchievement`, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data=>{
            console.log('Data unlockedAchievement====>',data)
            setUnlockedAchievement(data.unlockedAchievements)
            console.log('unlockedAch.', unlockedAchievement)
        })
        .catch(err=>console.error('Erreur fetch Top Players', err))
    },[])

    const sortedSuccesData=succesData.sort((a,b)=> {
        const aUnlocked = unlockedAchievement.some(ach => ach.name === a.name);
        const bUnlocked = unlockedAchievement.some(ach => ach.name === b.name);
        // Si a est débloqué et pas b → a avant b
        if(aUnlocked && !bUnlocked) return -1;
          // Si b est débloqué et pas a → b avant a
        if (!aUnlocked && bUnlocked) return 1;
          // Sinon garder l'ordre initial
        return 0;
    })


    const succes = sortedSuccesData.map((data, i)=> {
        const isUnlocked = unlockedAchievement.some(
            (ach) => ach.name === data.name)

            return <Achievement key={i} name={data.name} description={data.description} image={data.image} isUnlocked={isUnlocked}/>
       /* return (
            <View
      key={i}
      style={isUnlocked ? styles.unlockedAchievement : styles.lockedAchievement}
    >
      {false && <FontAwesome
        style={styles.icone}
        name={isUnlocked ? 'check-square-o' : 'square-o'}
        size={20}
        color={'#352c2bb0'}
      />}
        <View style={styles.imageContainer}>
            {isUnlocked ? <Image style={styles.image} source={getImage(data.image)}/> : 
            <FontAwesome
            style={styles.unlockIcon}
            name='lock'
            size={50}
            color={'#352c2bb0'}
        />}
        </View>
        <View style={styles.textContainer}>
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.description}>
          {data.description.endsWith('.') ? data.description : `${data.description}.`}
        </Text>
      </View>
    </View>
  );*/
});

  const medalsImages = [
    require('../assets/icon-top1.png'),
    require('../assets/icon-top2.png'),
    require('../assets/icon-top3.png')
  ];


    const topPlayersList = topPlayers.map((player, i) => {
        //const medalColor = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#554946';
        return (
    <View key={i} style={[styles.playerItem, i < 3 && styles.podiumItem]}>
      <View style={styles.playerRank}>
        <Image source={medalsImages[i]} style={styles.medal}/>
        <View style={styles.line}></View>
        <View style={styles.playerTextContainer}>
          <Text style={styles.playerUsername}>{player.username}</Text>
          <Text style={styles.playerScore}>{player.bestScore} <Text style={styles.jours}>jours</Text></Text>
        </View>
      </View>
      {player.username === user.username && <FontAwesome name='user' size={25} color='#554946'/>}
      
    </View>
  );
});

        return (
  <ImageBackground
    source={require('../assets/background.jpg')}
    resizeMode="cover"
    style={styles.container}
  >
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          AudioManager.playEffect('click');
          navigation.navigate('Home', { screen: 'Menu' });
        }}
      >
        <Image source={require('../assets/icon-arrow.png')} style={styles.leftArrow} />
      </TouchableOpacity>
    </View>

    <View style={styles.main}>
      <View style={styles.darkBackground}>
        <View style={styles.cardContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
              onPress={() => {
                AudioManager.playEffect('click');
                setActiveTab('leaderboard');
              }}
            >
              <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
                SUCCÈS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'personnal' && styles.activeTab]}
              onPress={() => {
                AudioManager.playEffect('click');
                setActiveTab('personnal');
              }}
            >
              <Text style={[styles.tabText, activeTab === 'personnal' && styles.activeTabText]}>
                STATS
              </Text>
            </TouchableOpacity>

            
          </View>

          {activeTab === 'personnal' && (
            <>
              <View style={styles.achievement}>
                <Text style={styles.achievementText}>Record personnel</Text>
              </View>

              <View style={styles.daysContainer}>
                <Text style={styles.days}>{user.bestScore}</Text>
              </View>
              <Text style={styles.myDays}>jour{user.bestScore === 0 ? '' : 's'} de survie</Text>

              <View style={styles.achievement}>
                <Text style={styles.achievementText}>Top Players</Text>
              </View>

              <View style={styles.leaderboardContainer}>
                                      
                      {topPlayersList}
                 
              </View>
            </>
          )}

          {activeTab === 'leaderboard' && (
            <>
              <View style={styles.achievement}>
                <Text style={styles.achievementText}>Liste des succès</Text>
              </View>

              <ScrollView contentContainerStyle={styles.scrollView}>
                {succes}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </View>
  </ImageBackground>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        height: undefined,
        width : '100%',
        paddingHorizontal: 40,
        paddingTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40
    },
    leftArrow:{
        width: '100%',
        height: '100%'
    },
    main: {
        width: '100%',
        height: '90%',
        paddingHorizontal: 36,
        paddingVertical: 30,
    },
    darkBackground:{
        backgroundColor : '#242120',
        width: '100%',
        height: '94%',
        borderRadius: 20,
        padding: 12,
    },
    cardContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor : '#342c29',
        width: '100%',
        height: '100%',
        borderRadius: 16,
        borderColor: '#554946',
        borderWidth: 5
    },
    daysContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        width: '48%',
        height: 60,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'black',
        backgroundColor: '#EFDAB7'
    },
    days: {
        color: 'black',
        fontSize: 35,
        fontFamily: 'ArialRounded',
    },
    achievement: {
        marginTop: 20,
        width: '100%',
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#554946'
    },
    achievementText: {
        fontSize: 20,
        fontFamily: 'ArialRounded',
        color: '#EFDAB7',
    },  
   scrollView: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        gap: 10,
        paddingTop : 10
    },
    tabContainer: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#554946',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        gap: 8,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#EFDAB7',
    },
    tabText: {
        fontSize: 16,
        fontFamily: 'ArialRounded',
        color: '#8B7355',
    },
    activeTabText: {
        color: '#EFDAB7',
        fontFamily: 'ArialRounded',
    },
    podiumItem: {
      paddingRight : 25
        
    },
    medal:{
      width: 50,
      height: 50
    },
    line: {
      height: 50,
      width: 1,
      backgroundColor: "#8B7355"
    },
    playerRank: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankNumber: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'ArialRounded',
    },
    playerScore: {
        color: '#554946',
        fontSize: 24,
        fontFamily: 'ArialRounded',
        fontWeight: 'bold'
    },
    emptyLeaderboard: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        gap: 15,
    },
    emptyText: {
        color: '#EFDAB7',
        fontSize: 16,
        textAlign: 'center',
    },

    leaderboardContainer: {
    marginTop: 15,
    width: '90%',
    height: '100%',
},
leaderboardTitle: {
    color: '#EFDAB7',
    fontSize: 16,
    fontFamily: 'ArialRounded',
    textAlign: 'center',
    marginBottom: 10,
},

leaderboardScroll: {
    flex: 1,
},
leaderboardContent: {
    gap: 8,
},
playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFDAB7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10

},
playerUsername:{
  fontFamily: 'ArialRounded',
  color: '#554946',
  fontSize: 14, 
  opacity: 0.8,
},
jours:{
    color: '#554946',
    fontSize: 15,
    fontFamily: 'ArialRounded',
    fontWeight: 'light',
},
myDays:{
    color: '#EFDAB7',
    fontSize: 18,
    fontFamily: 'ArialRounded',
    marginTop : 10
},
playerTextContainer: {
  flexDirection: 'column', 
  alignItems: 'flex-start',
},

});