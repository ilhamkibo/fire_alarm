import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

const Card = ({ icon, title, value, description }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TabBarIcon size={20} name={icon} color={"#0a4d8f"} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardContent}>{value}</Text>
      <Text style={styles.cardContent}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
  cardHeader: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 5,
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
});

export default Card;
