import React, { Component } from "react";
import { Text, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

export class TimeContainer extends Component {
  render() {
    const getCurrentDate = () => {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString("en-US", options);
      return formattedDate;
    };

    const getCurrentDay = () => {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const currentDate = new Date();
      const dayIndex = currentDate.getDay();
      const day = days[dayIndex];
      return day;
    };

    return (
      <ThemedView
        style={styles.container}
        lightColor="#333333"
        darkColor="#f0f0f0"
      >
        <View style={styles.cardContainer}>
          <View style={styles.day}>
            <TabBarIcon size={20} name={"calendar"} color={"#0a4d8f"} />
            <ThemedText
              type="defaultSemiBold"
              darkColor="#0a4d8f"
              lightColor="#0a4d8f"
            >
              {getCurrentDay()}
            </ThemedText>
          </View>
        </View>
        <View style={styles.cardContainer}>
          <ThemedText
            type="defaultSemiBold"
            darkColor="#0a4d8f"
            lightColor="#0a4d8f"
          >
            {getCurrentDate()}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }
}

const styles = {
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#1f2033",
    marginTop: 15,
    marginHorizontal: 23,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#1f2033",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  day: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  cardContainer: {
    color: "#000000",
    paddingHorizontal: 10,
  },
};

export default TimeContainer;
