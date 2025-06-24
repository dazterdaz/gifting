import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useSettingsStore } from '../../stores/settingsStore';
import { useActivityStore } from '../../stores/activityStore';
import { useAuthStore } from '../../stores/authStore';
import { TermsAndConditions } from '../../types';
import toast from 'react-hot-toast';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'align',
  'link'
];

const TermsEditor = () => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();
  const { logActivity } = useActivityStore();
  const { user } = useAuthStore();
  const [content, setContent] = useState(settings.terms?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const newTerms: TermsAndConditions = {
        id: settings.terms?.id || Math.random().toString(36).substring(2, 11),
        content,
        createdAt: new Date().toISOString(),
        createdBy: user.username,
        isActive: true
      };

      updateSettings({ terms: newTerms });
      
      await logActivity({
        userId: user.id,
        username: user.username,
        action: 'updated',
        targetType: 'terms',
        details: 'Actualizó los términos y condiciones'
      });
      
      toast.success('Términos y condiciones actualizados correctamente');
    } catch (error) {
      console.error('Error updating terms:', error);
      toast.error('Error al actualizar los términos y condiciones');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Términos y Condiciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-h-[400px]">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            className="h-[300px] bg-white dark:bg-gray-800"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSave}
          isLoading={isSubmitting}
          leftIcon={<Save className="h-4 w-4" />}
        >
          Guardar Cambios
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TermsEditor;