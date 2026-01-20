import { useParams } from 'react-router-dom';
import EditorWrapper from '../components/editor/Editor';

export const Edit = () => {
  const { filename } = useParams<{ filename: string }>();

  if (!filename) {
    return <div>Loading...</div>
  }

  return (
    <EditorWrapper
      fileName={filename}
    />
  );
};
