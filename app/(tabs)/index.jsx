import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  Button,
  Platform,
} from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import Paho from "paho-mqtt";
import TimeContainer from "../../components/TimeContainer";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const HomeScreen = () => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState([]);
  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef();
  const responseListener = useRef();

  const [data, setData] = useState({
    asapValue: 30,
    suhuValue: 10,
    apiValue: 30,
    asap: "Normal",
    suhu: "Tipis",
    output: "Normal",
    api: "Lemah",
  });
  const alertVisible = useRef(false);
  const clientRef = useRef(null);
  const reconnectTimeout = useRef(null);

  const getFuzzyFire = (fire) => {
    if (fire < 30) {
      return "Lemah";
    } else if (fire >= 30 && fire <= 70) {
      return "Sedang";
    } else {
      return "Kuat";
    }
  };

  const getFuzzyAsap = (asapValue) => {
    if (asapValue < 30) {
      return "Tipis";
    } else if (asapValue >= 30 && asapValue <= 70) {
      return "Sedang";
    } else {
      return "Pekat";
    }
  };

  const getFuzzySuhu = (temp) => {
    if (temp < 30) {
      return "Normal";
    } else if (temp >= 30 && temp <= 70) {
      return "Hangat";
    } else {
      return "Panas";
    }
  };

  const getFuzzyOutput = (suhu, asap, api) => {
    let output;
    if (suhu === "Normal") {
      if (asap === "Tipis") {
        if (api === "Lemah") output = "Normal";
        if (api === "Sedang") output = "Normal";
        if (api === "Kuat") output = "Siaga";
      } else if (asap === "Sedang") {
        if (api === "Lemah") output = "Normal";
        if (api === "Sedang") output = "Siaga";
        if (api === "Kuat") output = "Siaga";
      } else if (asap === "Pekat") {
        if (api === "Lemah") output = "Siaga";
        if (api === "Sedang") output = "Siaga";
        if (api === "Kuat") output = "Bahaya";
      }
    } else if (suhu === "Hangat") {
      if (asap === "Tipis") {
        if (api === "Lemah") output = "Normal";
        if (api === "Sedang") output = "Normal";
        if (api === "Kuat") output = "Siaga";
      } else if (asap === "Sedang") {
        if (api === "Lemah") output = "Siaga";
        if (api === "Sedang") output = "Siaga";
        if (api === "Kuat") output = "Siaga";
      } else if (asap === "Pekat") {
        if (api === "Lemah") output = "Siaga";
        if (api === "Sedang") output = "Siaga";
        if (api === "Kuat") output = "Bahaya";
      }
    } else if (suhu === "Panas") {
      if (asap === "Tipis") {
        if (api === "Lemah") output = "Siaga";
        if (api === "Sedang") output = "Siaga";
        if (api === "Kuat") output = "Bahaya";
      } else if (asap === "Sedang") {
        if (api === "Lemah") output = "Siaga";
        if (api === "Sedang") output = "Bahaya";
        if (api === "Kuat") output = "Bahaya";
      } else if (asap === "Pekat") {
        if (api === "Lemah") output = "Siaga";
        if (api === "Sedang") output = "Bahaya";
        if (api === "Kuat") output = "Bahaya";
      }
    }
    console.log("🚀 ~ getFuzzyOutput ~ output:", output);

    if (output === "Siaga" || output === "Bahaya") {
      createTwoButtonAlert(
        output,
        `Nilai Api = ${api}, Nilai Suhu = ${suhu}, Nilai Asap = ${asap}`
      );
    }

    return output || "Tidak Diketahui"; // Default case if none of the conditions match
  };

  const createTwoButtonAlert = (title, subtitle) => {
    if (alertVisible.current) {
      return;
    }
    alertVisible.current = true;
    Alert.alert(title, subtitle, [
      {
        text: "OK",
        onPress: () => {
          alertVisible.current = false;
        },
      },
    ]);
  };

  const connectClient = () => {
    if (!clientRef.current) {
      clientRef.current = new Paho.Client(
        "broker.emqx.io",
        Number(8083),
        "bjirr"
      );

      clientRef.current.onConnectionLost = (responseObject) => {
        if (responseObject.errorCode !== 0) {
          console.log("Connection lost:", responseObject.errorMessage);
          if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
          }
          reconnectTimeout.current = setTimeout(connectClient, 5000);
        }
      };
      clientRef.current.onMessageArrived = (message) => {
        const payload = JSON.parse(message.payloadString);
        const apiString = getFuzzyFire(Number(payload.api));
        const asapString = getFuzzyAsap(Number(payload.asap));
        const suhuString = getFuzzySuhu(Number(payload.suhu));
        if (payload.status == "Siaga" || payload.status == "Bahaya") {
          createTwoButtonAlert(
            `${payload.status}!`,
            `Api = ${apiString}, Suhu = ${asapString}, Asap = ${suhuString}`
          );
          schedulePushNotification(
            `${payload.status}!`,
            `Api = ${apiString}, Suhu = ${asapString}, Asap = ${suhuString}`
          );
        }
        // getFuzzyOutput(
        // suhuString,
        // asapString,
        // apiString
        // );
        setData((prevData) => ({
          ...prevData,
          apiValue: payload.api,
          suhuValue: Number(payload.suhu).toFixed(2),
          asapValue: payload.asap,
          api: apiString,
          suhu: suhuString,
          asap: asapString,
          output: payload.status,
        }));
      };
    }

    clientRef.current.connect({
      onSuccess: () => {
        console.log("Connected");
        clientRef.current.subscribe("fire-alarm");
      },
      onFailure: (err) => {
        console.log("Connection failed:", err);
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
        reconnectTimeout.current = setTimeout(connectClient, 5000);
      },
    });
  };

  useEffect(() => {
    connectClient();

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token)
    );

    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? [])
      );
    }
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <TimeContainer />
      <View style={styles.cardContainer}>
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <TabBarIcon size={20} name={"cloud"} color={"#0a4d8f"} />
              <Text style={styles.cardTitle}>Asap</Text>
            </View>
            <Text style={styles.cardContent}>{data.asapValue}</Text>
            <Text style={styles.cardContent}>{data.asap}</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <TabBarIcon size={20} name={"thermometer"} color={"#0a4d8f"} />
              <Text style={styles.cardTitle}>Suhu</Text>
            </View>
            <Text style={styles.cardContent}>{data.suhuValue}</Text>
            <Text style={styles.cardContent}>{data.suhu}</Text>
          </View>
        </View>
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <TabBarIcon size={20} name={"bonfire"} color={"#0a4d8f"} />
              <Text style={styles.cardTitle}>Api</Text>
            </View>
            <Text style={styles.cardContent}>{data.apiValue}</Text>
            <Text style={styles.cardContent}>{data.api}</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <TabBarIcon
                size={20}
                name={"checkmark-circle"}
                color={"#0a4d8f"}
              />
              <Text style={styles.cardTitle}>Output</Text>
            </View>
            <Text style={[styles.cardContent, { marginTop: 10 }]}>
              {data.output}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.wleo}>
        <Image
          source={require("../../assets/images/fkom.png")}
          style={{
            width: 200,
            height: 100,
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wleo: {
    flex: 1,
    marginTop: 10,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    backgroundColor: "#18192b", // Ganti warna background di sini
  },
  headerImage: {
    color: "#000",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  cardContainer: {
    flex: 1,
    padding: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 8,
  },
  card: {
    backgroundColor: "#1f2033",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 8,
    width: "45%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0a4d8f",
  },
  cardContent: {
    fontSize: 16,
    textAlign: "center",
    color: "#616177",
  },
  iconContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 5,
  },
  image: {
    flex: 1,
    width: "100%",
    backgroundColor: "#0553",
  },
});

async function schedulePushNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: { data: "goes here", test: { test1: "more data" } },
    },
    trigger: { seconds: 1 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}

export default HomeScreen;
