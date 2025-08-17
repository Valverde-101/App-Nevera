// RecipeBookScreen.js – dark–premium v2.2.14
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRecipes } from '../context/RecipeContext';
import { useInventory } from '../context/InventoryContext';
import AddRecipeModal from '../components/AddRecipeModal';
import { useLocations } from '../context/LocationsContext';
import { useNavigation } from '@react-navigation/native';

const palette = {
  bg: '#121316',
  surface: '#191b20',
  surface2: '#20242c',
  surface3: '#262b35',
  text: '#ECEEF3',
  textDim: '#A8B1C0',
  border: '#2c3038',
  accent: '#F2B56B',
};

export default function RecipeBookScreen({ navigation }) {
  const nav = useNavigation();
  const { recipes, addRecipe } = useRecipes();
  const { inventory } = useInventory();
  const { locations } = useLocations();
  const [addVisible, setAddVisible] = useState(false);

  useLayoutEffect(() => {
    nav.setOptions?.({
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
      title: 'Recetario',
      headerRight: () => (
        <TouchableOpacity onPress={() => setAddVisible(true)} style={styles.headerIconBtn}>
          <Text style={styles.headerIconTxt}>＋</Text>
        </TouchableOpacity>
      ),
    });
  }, [nav]);

  const hasIngredients = (recipe) => {
    return recipe.ingredients.every((ing) => {
      const available = locations.reduce((sum, loc) => {
        const item = (inventory[loc.key] || []).find((it) => it.name === ing.name);
        return sum + (item ? item.quantity : 0);
      }, 0);
      return available >= ing.quantity;
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.gridWrap}
        showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
      >
        {recipes.map((rec, idx) => {
          const enough = hasIngredients(rec);
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.card, !enough && styles.cardDim]}
              onPress={() => navigation.navigate('RecipeDetail', { index: idx })}
            >
              <View style={styles.thumbWrap}>
                {rec.image ? (
                  <Image source={{ uri: rec.image }} style={styles.thumb} resizeMode="cover" />
                ) : (
                  <View style={styles.thumbPlaceholder}>
                    <Text style={{ color: palette.textDim }}>Sin imagen</Text>
                  </View>
                )}
                {!enough && <Text style={styles.badge}>Faltan</Text>}
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>{rec.name}</Text>
              <Text style={styles.cardMeta}>Para {rec.persons} personas • Dificultad: {rec.difficulty}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <AddRecipeModal
        visible={addVisible}
        onSave={(recipe) => {
          addRecipe(recipe);
          setAddVisible(false);
        }}
        onClose={() => setAddVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  headerIconBtn: {
    backgroundColor: palette.surface2,
    borderColor: palette.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  headerIconTxt: { color: palette.text, fontSize: 18 },
  scroll: {
    ...(Platform.OS === 'web'
      ? {
          scrollbarWidth: 'thin',
          scrollbarColor: `${palette.accent} ${palette.surface2}`,
          scrollbarGutter: 'stable both-edges',
          overscrollBehavior: 'contain',
        }
      : {}),
  },
  gridWrap: {
    padding: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    width: '33.33%',
    padding: 8,
  },
  cardDim: { opacity: 0.75 },
  thumbWrap: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface2,
    marginBottom: 6,
  },
  thumb: { width: '100%', aspectRatio: 16 / 9 },
  thumbPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#2a1d1d',
    color: '#ff9f9f',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5a2e2e',
    fontSize: 12,
  },
  cardTitle: { color: palette.text, fontWeight: '700' },
  cardMeta: { color: palette.textDim, fontSize: 12 },
});