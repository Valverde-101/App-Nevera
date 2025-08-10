import React, {forwardRef, useRef, useImperativeHandle} from 'react';
import {Platform, View} from 'react-native';

let NativeEditor; let NativeToolbar;
if (Platform.OS !== 'web') {
  const rnq = require('react-native-cn-quill');
  NativeEditor = rnq.default;
  NativeToolbar = rnq.QuillToolbar;
}

const QuillEditor = forwardRef(({initialHtml, onHtmlChange, style, readonly, ...props}, ref) => {
  if (Platform.OS === 'web') {
    const ReactQuill = require('react-quill');
    const webRef = useRef(null);
    useImperativeHandle(ref, () => ({
      getHtml: async () => webRef.current ? webRef.current.getEditor().root.innerHTML : '',
    }));
    return (
      <View style={style}>
        <ReactQuill
          ref={webRef}
          readOnly={readonly}
          defaultValue={initialHtml}
          onChange={html => onHtmlChange && onHtmlChange({html})}
          theme="snow"
          style={{height: '100%', width: '100%'}}
        />
      </View>
    );
  }
  const nativeRef = useRef(null);
  useImperativeHandle(ref, () => ({
    getHtml: () => nativeRef.current?.getHtml(),
  }));
  return (
    <NativeEditor
      ref={nativeRef}
      initialHtml={initialHtml}
      onHtmlChange={onHtmlChange}
      style={style}
      readonly={readonly}
      {...props}
    />
  );
});

export const QuillToolbar = props => {
  if (Platform.OS === 'web') return null;
  return <NativeToolbar {...props} />;
};

export default QuillEditor;
