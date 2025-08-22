// RecipeDetailScreen.js – dark–premium v2.2.14
import React, { useLayoutEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useRecipes } from '../context/RecipeContext';
import { useInventory } from '../context/InventoryContext';
import { useShopping } from '../context/ShoppingContext';
import AddRecipeModal from '../components/AddRecipeModal';
import { getFoodIcon, getFoodCategory } from '../foodIcons';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';
import { useCategories } from '../context/CategoriesContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function RecipeDetailScreen({ route }) {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const nav = useNavigation();
  const { index } = route.params;
  const { recipes, updateRecipe } = useRecipes();
  const { inventory } = useInventory();
  const { addItems } = useShopping();
  const recipe = recipes[index];
  const { getLabel } = useUnits();
  const { locations } = useLocations();
  const { categories } = useCategories();
  const [editVisible, setEditVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const groupedIngredients = useMemo(() => {
    if (!recipe) return {};
    return recipe.ingredients.reduce((acc, ing) => {
      const cat = getFoodCategory(ing.name) || 'otros';
      acc[cat] = acc[cat] || [];
      acc[cat].push(ing);
      return acc;
    }, {});
  }, [recipe]);

  const categoryOrder = Object.keys(categories);
  const groupedOrder = [
    ...categoryOrder.filter((cat) => groupedIngredients[cat]),
    ...Object.keys(groupedIngredients).filter((cat) => !categoryOrder.includes(cat)),
  ];

  const missing = useMemo(() => {
    if (!recipe) return [];
    return recipe.ingredients.filter((ing) => {
      const available = locations.reduce((sum, loc) => {
        const item = (inventory[loc.key] || []).find((it) => it.name === ing.name);
        return sum + (item ? item.quantity : 0);
      }, 0);
      return available < ing.quantity;
    });
  }, [recipe, locations, inventory]);

  useLayoutEffect(() => {
    nav.setOptions?.({
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
      title: recipe ? recipe.name : 'Receta',
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => setEditVisible(true)} style={[styles.iconBtn, { marginRight: 8 }]}>
            <Text style={styles.iconTxt}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { if (missing.length > 0) setConfirmVisible(true); }}
            style={styles.iconBtn}
          >
            <Text style={styles.iconTxt}>🛒</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [nav, missing, recipe, palette]);

  if (!recipe) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.bg }}>
        <Text style={{ color: palette.textDim }}>Receta no encontrada</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
      >
        {recipe.image ? (
          <Image
            source={{ uri: recipe.image }}
            style={styles.hero}
            resizeMode="cover"
          />
        ) : null}
        <Text style={styles.title}>{recipe.name}</Text>
        <Text style={styles.meta}>Para {recipe.persons} personas • Dificultad: {recipe.difficulty}</Text>

        <Text style={styles.blockTitle}>Ingredientes</Text>
        {groupedOrder.map((cat) => (
          <View key={cat} style={styles.section}>
            <View style={styles.sectionHeader}>
              {categories[cat]?.icon && <Image source={categories[cat].icon} style={styles.catIcon} />}
              <Text style={styles.sectionTitle}>{categories[cat]?.name || cat}</Text>
            </View>
            {groupedIngredients[cat].map((ing, idx) => {
              const icon = ing.icon || getFoodIcon(ing.name);
              return (
                <View key={idx} style={styles.ingRow}>
                  {icon && <Image source={icon} style={styles.ingIcon} />}
                    <Text style={styles.ingText}>
                      {ing.quantity} {getLabel(ing.quantity, ing.unit)} de <Text style={{ color: palette.foodName }}>{ing.name}</Text>
                    </Text>
                </View>
              );
            })}
          </View>
        ))}

        <Text style={styles.blockTitle}>Pasos</Text>
        <Markdown
          style={{
            body: { color: palette.text, lineHeight: 20 },
            list_item: { color: palette.text },
            paragraph: { color: palette.text },
            bullet_list: { color: palette.text },
            ordered_list: { color: palette.text },
            fence: { color: palette.text },
            code_block: { color: palette.text },
          }}
        >
          {recipe.steps}
        </Markdown>
      </ScrollView>

      <AddRecipeModal
        visible={editVisible}
        initialRecipe={recipe}
        onSave={(r) => {
          updateRecipe(index, r);
          setEditVisible(false);
        }}
        onClose={() => setEditVisible(false)}
      />

      {/* Confirmar añadir a compras */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setConfirmVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Añadir a compras</Text>
                <Text style={styles.modalBody}>¿Quieres añadir los siguientes ingredientes faltantes a la lista de compras?</Text>
                <View style={{ maxHeight: 220 }}>
                  <ScrollView>
                      {missing.map((ing, idx) => (
                        <View key={idx} style={styles.missRow}>
                          {(ing.icon || getFoodIcon(ing.name)) && (
                            <Image source={ing.icon || getFoodIcon(ing.name)} style={styles.missIcon} />
                          )}
                          <Text style={styles.missText}>
                            {ing.quantity} {getLabel(ing.quantity, ing.unit)} de <Text style={{ color: palette.foodName }}>{ing.name}</Text>
                          </Text>
                        </View>
                      ))}
                  </ScrollView>
                </View>
                <Text style={[styles.modalBody, { marginTop: 8 }]}>¿O deseas añadir <Text style={{ color: palette.accent, fontWeight: '700' }}>todos</Text> los ingredientes?</Text>
                <View style={styles.modalRow}>
                  <TouchableOpacity onPress={() => setConfirmVisible(false)} style={[styles.modalBtn, { backgroundColor: palette.surface3 }]}>
                    <Text style={{ color: palette.text }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      addItems(missing.map((ing) => ({ name: ing.name, quantity: ing.quantity, unit: ing.unit })));
                      setConfirmVisible(false);
                    }}
                    style={[styles.modalBtn, { backgroundColor: palette.accent }]}
                  >
                    <Text style={{ color: '#1b1d22', fontWeight: '700' }}>Añadir faltantes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      addItems(recipe.ingredients.map((ing) => ({ name: ing.name, quantity: ing.quantity, unit: ing.unit })));
                      setConfirmVisible(false);
                    }}
                    style={[styles.modalBtn, { backgroundColor: palette.selected, borderColor: palette.frame }]}
                  >
                    <Text style={{ color: palette.accent, fontWeight: '700' }}>Añadir todos</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const createStyles = (palette) => StyleSheet.create({
  scroll: {
    backgroundColor: palette.bg,
    ...(Platform.OS === 'web'
      ? {
          scrollbarWidth: 'thin',
          scrollbarColor: `${palette.accent} ${palette.surface2}`,
          scrollbarGutter: 'stable both-edges',
          overscrollBehavior: 'contain',
        }
      : {}),
  },
  hero: {
    width: '35%',
    aspectRatio: 16 / 9,
    marginBottom: 10,
    alignSelf: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  title: { color: palette.text, fontSize: 22, fontWeight: '700' },
  meta: { color: palette.textDim, marginBottom: 6 },

  blockTitle: { color: palette.text, fontWeight: '700', fontSize: 16, marginTop: 12 },
  section: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.surface3,
    borderBottomWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: { color: palette.text, fontWeight: '700', textTransform: 'capitalize' },
  catIcon: { width: 20, height: 20, marginRight: 6 },

  ingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  ingIcon: { width: 20, height: 20, marginRight: 6 },
  ingText: { color: palette.text },

  iconBtn: {
    backgroundColor: palette.surface2,
    borderColor: palette.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  iconTxt: { color: palette.text, fontSize: 16 },

  // modal
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    width: '100%',
    maxWidth: 520,
  },
  modalTitle: { color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: 6 },
  modalBody: { color: palette.textDim },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  modalBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    marginHorizontal: 6,
  },
  missRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  missIcon: { width: 20, height: 20, marginRight: 6 },
  missText: { color: palette.text },
});
