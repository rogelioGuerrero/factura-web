// Este archivo se utiliza para configurar el entorno de construcción de Netlify
// y resolver problemas específicos con módulos nativos como @rollup/rollup-linux-x64-gnu

console.log('Configurando entorno de construcción para Netlify...');

// Establecer variables de entorno para evitar problemas con módulos nativos
process.env.ROLLUP_SKIP_LOAD_CONFIG_FILE = 'true';
process.env.SKIP_OPTIONAL_DEPENDENCIES = 'true';

console.log('Configuración completada. Iniciando proceso de construcción...');
