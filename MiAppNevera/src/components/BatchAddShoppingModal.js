import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  Pressable,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUnits } from '../context/UnitsContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme, useThemeController } from '../context/ThemeContext';
import { gradientForKey } from '../theme/gradients';
import { getFoodInfo } from '../foodIcons';
import { useDefaultFoods } from '../context/DefaultFoodsContext';

export default function BatchAddShoppingModal({ visible, items = [], onSave, onClose }) {
  const palette = useTheme();
  const { themeName } = useThemeController();
  const styles = useMemo(() => createStyles(palette, themeName), [palette, themeName]);
  const { units, getLabel } = useUnits();
  const { t } = useLanguage();
  // subscribe to default food overrides so batch names update after refresh
  const { overrides } = useDefaultFoods();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (visible) {
      setData(
        items.map(item => ({
          quantity: '1',
          unit: item.defaultUnit || units[0]?.key || 'units',
          unitPriceText: item.defaultPrice ? String(item.defaultPrice) : '',
          totalPriceText: item.defaultPrice ? String(item.defaultPrice) : '',
        })),
      );
    }
  }, [visible, items, units, overrides]);

  const updateItem = (index, changes) => {
    setData(prev => prev.map((d, i) => (i === index ? { ...d, ...changes } : d)));
  };

  const saveAll = () => {
    onSave(
      items.map((item, idx) => ({
        name: item.name,
        quantity: parseFloat(data[idx]?.quantity) || 0,
        unit: data[idx]?.unit || units[0]?.key || 'units',
        unitPrice: parseFloat(data[idx]?.unitPriceText) || 0,
        totalPrice: parseFloat(data[idx]?.totalPriceText) || 0,
      })),
    );
  };

  const g = gradientForKey(themeName, 'batch');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Text style={styles.iconText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveAll} style={styles.iconBtnAccent}>
              <Text style={styles.iconTextOnAccent}>{t('system.common.save')}</Text>
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={g.colors}
            locations={g.locations}
            start={g.start}
            end={g.end}
            style={styles.hero}
          >
            <Text style={styles.heroTitle}>{t('system.shopping.batchAdd.title', { count: items.length })}</Text>
          </LinearGradient>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
            showsVerticalScrollIndicator={Platform.OS === 'web'}
          >
              {items.map((item, idx) => {
                const gi = gradientForKey(themeName, item.name);
                const entry = data[idx] || {};
                const qty = parseFloat(entry.quantity) || 0;
                const info = getFoodInfo(item.name);
                const label = info?.name || item.name;
                return (
                  <View key={idx} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <LinearGradient
                        colors={gi.colors}
                        locations={gi.locations}
                        start={gi.start}
                        end={gi.end}
                        style={styles.cardRibbon}
                      >
                        {item.icon && <Image source={item.icon} style={styles.ribbonIcon} />}
                        <Text style={styles.ribbonTitle} numberOfLines={1} ellipsizeMode="tail">
                          {label}
                        </Text>
                      </LinearGradient>
                      <Text style={styles.cardMeta}>
                        {qty} {getLabel(qty, entry.unit)}
                      </Text>
                    </View>

                  <Text style={styles.labelBold}>{t('system.shopping.batchAdd.quantity')}</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      onPress={() =>
                        setData(prev =>
                          prev.map((d, i) => {
                            if (i !== idx) return d;
                            const nextQty = Math.max(0, (parseFloat(d.quantity) || 0) - 1);
                            let unitPriceText = d.unitPriceText;
                            let totalPriceText = d.totalPriceText;
                            if (unitPriceText) {
                              const u = parseFloat(unitPriceText) || 0;
                              const tot = u * nextQty;
                              totalPriceText = tot ? tot.toFixed(2) : '';
                            } else if (totalPriceText) {
                              const t = parseFloat(totalPriceText) || 0;
                              const u = nextQty ? t / nextQty : 0;
                              unitPriceText = u ? u.toFixed(2) : '';
                            }
                            return {
                              ...d,
                              quantity: String(nextQty),
                              unitPriceText,
                              totalPriceText,
                            };
                          }),
                        )
                      }
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.qtyInput}
                      keyboardType="numeric"
                      value={String(entry.quantity)}
                      onChangeText={t =>
                        setData(prev =>
                          prev.map((d, i) => {
                            if (i !== idx) return d;
                            const sanitized = t.replace(/[^0-9.]/g, '');
                            const q = parseFloat(sanitized) || 0;
                            let unitPriceText = d.unitPriceText;
                            let totalPriceText = d.totalPriceText;
                            if (unitPriceText) {
                              const u = parseFloat(unitPriceText) || 0;
                              const tot = u * q;
                              totalPriceText = tot ? tot.toFixed(2) : '';
                            } else if (totalPriceText) {
                              const tot = parseFloat(totalPriceText) || 0;
                              const u = q ? tot / q : 0;
                              unitPriceText = u ? u.toFixed(2) : '';
                            }
                            return {
                              ...d,
                              quantity: sanitized,
                              unitPriceText,
                              totalPriceText,
                            };
                          }),
                        )
                      }
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setData(prev =>
                          prev.map((d, i) => {
                            if (i !== idx) return d;
                            const nextQty = (parseFloat(d.quantity) || 0) + 1;
                            let unitPriceText = d.unitPriceText;
                            let totalPriceText = d.totalPriceText;
                            if (unitPriceText) {
                              const u = parseFloat(unitPriceText) || 0;
                              const tot = u * nextQty;
                              totalPriceText = tot ? tot.toFixed(2) : '';
                            } else if (totalPriceText) {
                              const t = parseFloat(totalPriceText) || 0;
                              const u = nextQty ? t / nextQty : 0;
                              unitPriceText = u ? u.toFixed(2) : '';
                            }
                            return {
                              ...d,
                              quantity: String(nextQty),
                              unitPriceText,
                              totalPriceText,
                            };
                          }),
                        )
                      }
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>＋</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.labelBold}>{t('system.shopping.batchAdd.unit')}</Text>
                  <View style={styles.chipWrap}>
                    {units.map(opt => (
                      <Pressable
                        key={opt.key}
                        onPress={() => updateItem(idx, { unit: opt.key })}
                        style={[
                          styles.chip,
                          entry.unit === opt.key && styles.chipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            entry.unit === opt.key && styles.chipTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {opt.plural}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.labelBold}>{t('system.shopping.batchAdd.price')}</Text>
                  <View style={styles.priceRow}>
                    <TextInput
                      style={[styles.priceInput, { marginRight: 4 }]}
                      keyboardType="decimal-pad"
                      inputMode="decimal"
                      placeholder={t('system.shopping.batchAdd.unitPricePlaceholder')}
                      placeholderTextColor={palette.textDim}
                      value={entry.unitPriceText || ''}
                      onChangeText={t => {
                        const sanitized = t.replace(/[^0-9.]/g, '');
                        const q = parseFloat(entry.quantity) || 0;
                        const u = parseFloat(sanitized);
                        const tot = !isNaN(u) && q ? u * q : 0;
                        updateItem(idx, {
                          unitPriceText: sanitized,
                          totalPriceText: tot ? tot.toFixed(2) : '',
                        });
                      }}
                    />
                    <Text style={styles.priceDivider}>/</Text>
                    <TextInput
                      style={[styles.priceInput, { marginLeft: 4 }]}
                      keyboardType="decimal-pad"
                      inputMode="decimal"
                      placeholder={t('system.shopping.batchAdd.totalPricePlaceholder')}
                      placeholderTextColor={palette.textDim}
                      value={entry.totalPriceText || ''}
                      onChangeText={t => {
                        const sanitized = t.replace(/[^0-9.]/g, '');
                        const q = parseFloat(entry.quantity) || 0;
                        const tot = parseFloat(sanitized);
                        const u = !isNaN(tot) && q ? tot / q : 0;
                        updateItem(idx, {
                          totalPriceText: sanitized,
                          unitPriceText: u ? u.toFixed(2) : '',
                        });
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(palette, themeName) {
  return StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sheet: {
      maxHeight: '80%',
      width: '90%',
      backgroundColor: palette.bg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.border,
      overflow: 'hidden',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 6,
      backgroundColor: palette.surface,
      borderBottomWidth: 1,
      borderColor: palette.border,
    },
    iconBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: palette.surface2,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.border,
    },
    iconBtnAccent: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: palette.accent,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e2b06c',
    },
    iconText: { color: palette.text, fontSize: 18 },
    iconTextOnAccent: {
      color: themeName === 'light' ? '#1b1d22' : palette.bg,
      fontWeight: '700',
    },
    hero: {
      padding: 14,
      borderBottomWidth: 1,
      borderColor: palette.frame,
    },
    heroTitle: { color: palette.accent, fontSize: 18, fontWeight: '400' },
    scroll: {
      ...(Platform.OS === 'web'
        ? {
            scrollbarWidth: 'thin',
            scrollbarColor: `${palette.border} transparent`,
            scrollbarGutter: 'stable both-edges',
            overscrollBehavior: 'contain',
          }
        : {}),
    },
    card: {
      backgroundColor: palette.surface2,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 12,
      marginBottom: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    cardRibbon: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.frame || palette.border,
    },
    ribbonIcon: { width: 32, height: 32, marginRight: 10, resizeMode: 'contain' },
    ribbonTitle: { color: palette.text, fontWeight: '800', fontSize: 18 },
    cardMeta: { color: palette.textDim },
    labelBold: { color: palette.text, fontWeight: '700', marginBottom: 6, marginTop: 10 },
    qtyRow: { flexDirection: 'row', alignItems: 'center' },
    qtyBtn: {
      backgroundColor: palette.surface3,
      borderWidth: 1,
      borderColor: palette.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      marginHorizontal: 4,
    },
    qtyBtnText: { color: palette.accent, fontSize: 18 },
    qtyInput: {
      width: 80,
      textAlign: 'center',
      backgroundColor: palette.surface2,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
      color: palette.text,
    },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: palette.surface2,
      borderWidth: 1,
      borderColor: palette.border,
      marginRight: 8,
      marginBottom: 8,
    },
    chipSelected: { backgroundColor: palette.surface3, borderColor: palette.accent },
    chipText: { color: palette.text },
    chipTextSelected: { color: palette.accent },
    priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    priceInput: {
      flex: 1,
      textAlign: 'center',
      backgroundColor: palette.surface2,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
      color: palette.text,
    },
    priceDivider: { color: palette.text, paddingHorizontal: 4 },
  });
}
