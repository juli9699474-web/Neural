import React, { useState } from "react";
import { SafeAreaView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { BUILDER_STEPS } from "@neural/shared";

const tabs = ["Chat", "Projects", "Tasks", "Builder", "Settings"] as const;

export default function App() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Chat");
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090b", padding: 16 }}>
      <Text style={{ color: "white", fontSize: 28, fontWeight: "700" }}>Neural Mobile</Text>
      <View style={{ flexDirection: "row", marginVertical: 12, flexWrap: "wrap", gap: 6 }}>
        {tabs.map((item) => (
          <TouchableOpacity key={item} onPress={() => setTab(item)} style={{ borderWidth: 1, borderColor: "#3f3f46", borderRadius: 8, padding: 8, backgroundColor: tab === item ? "#27272a" : "transparent" }}>
            <Text style={{ color: "white" }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === "Builder" ? (
        <FlatList data={[...BUILDER_STEPS]} keyExtractor={(item) => item} renderItem={({ item }) => <Text style={{ color: "#d4d4d8", marginBottom: 8 }}>{item}</Text>} />
      ) : (
        <Text style={{ color: "#a1a1aa", marginTop: 20 }}>{tab} screen with offline cache for projects and recent chats.</Text>
      )}
    </SafeAreaView>
  );
}
