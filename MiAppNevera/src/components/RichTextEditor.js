import React, { useRef } from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function RichTextEditor({ value, onChange, placeholder }) {
  const palette = useTheme();

  if (Platform.OS === 'web') {
    const ReactQuill = require('react-quill');
    require('react-quill/dist/quill.snow.css');
    return (
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  }

  const { RichEditor, RichToolbar, actions } = require('react-native-pell-rich-editor');
  const editorRef = useRef();
  return (
    <>
      <RichToolbar
        editor={editorRef}
        actions={[actions.setBold, actions.setItalic, actions.insertOrderedList, actions.insertBulletsList, actions.insertLink, actions.insertImage]}
        style={{ backgroundColor: palette.surface3, borderColor: palette.border, borderWidth: 1, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
        iconTint={palette.text}
      />
      <RichEditor
        ref={editorRef}
        initialContentHTML={value}
        onChange={onChange}
        placeholder={placeholder}
        editorStyle={{ backgroundColor: palette.surface2, color: palette.text, placeholderColor: palette.textDim }}
        style={{ minHeight: 120, borderColor: palette.border, borderWidth: 1, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
      />
    </>
  );
}
