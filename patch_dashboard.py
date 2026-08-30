import re

with open('frontend/src/app/dashboard/page.tsx', 'r') as f:
    text = f.read()

# Add autoSave logic inside handleStartAnalysis
auto_save_snippet = """
      setResult(data);
      toast.success('¡Análisis completado con éxito!');
      
      // AUTO SAVE PROJECT
      if (user) {
        try {
          const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
          const savePromise = addDoc(collection(db, 'users', user.uid, 'analyses'), {
            filename: data.filename || 'dataset',
            target_col: data.target_col || data.target_column || '',
            created_at: serverTimestamp(),
            result_data: JSON.stringify(data)
          });
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000));
          const docRef = await Promise.race([savePromise, timeout]) as any;
          if (docRef?.id) {
            try {
              localStorage.setItem(`mio_result_${docRef.id}`, JSON.stringify(data));
            } catch (storageErr) {
              console.warn('localStorage full');
            }
          }
          logSystemEvent('project_saved_auto', { uid: user.uid, filename: data.filename });
          toast.success('💾 Guardado automáticamente en Mis Proyectos');
        } catch (e) {
          console.error('Auto-save error:', e);
        }
      }
"""

text = text.replace("setResult(data);\n      toast.success('¡Análisis completado con éxito!');", auto_save_snippet)

# Remove the Guardar Proyecto button
save_btn_pattern = r'<button[^>]*onClick=\{handleSaveProject\}[^>]*>[\s\S]*?</button>'
text = re.sub(save_btn_pattern, '', text)

with open('frontend/src/app/dashboard/page.tsx', 'w') as f:
    f.write(text)
