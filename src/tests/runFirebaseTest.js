// Script para ejecutar las pruebas de Firebase CRUD
import { exec } from 'child_process';
import path from 'path';

console.log('Ejecutando pruebas de Firebase CRUD...');

// Compilar el archivo TypeScript a JavaScript
exec('npx tsc src/tests/firebaseCrudTest.ts --esModuleInterop --resolveJsonModule --outDir dist/tests', (error, stdout, stderr) => {
  if (error) {
    console.error('Error al compilar el archivo TypeScript:', error);
    return;
  }
  
  if (stderr) {
    console.error('Error de compilación:', stderr);
    return;
  }
  
  console.log('Archivo TypeScript compilado correctamente.');
  
  // Ejecutar el archivo JavaScript compilado
  exec('node dist/tests/firebaseCrudTest.js', (error, stdout, stderr) => {
    if (error) {
      console.error('Error al ejecutar las pruebas:', error);
      return;
    }
    
    console.log('Resultado de las pruebas:');
    console.log(stdout);
    
    if (stderr) {
      console.error('Errores durante la ejecución:');
      console.error(stderr);
    }
  });
});
