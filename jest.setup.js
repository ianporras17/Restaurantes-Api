// jest.setup.js
// Antes de cada test, reemplazamos console.error
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  