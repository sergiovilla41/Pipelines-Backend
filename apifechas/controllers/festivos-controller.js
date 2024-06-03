const connectToDatabase = require('../Config/mongodb');
const fechas = require('../Services/fechas');

/**
 * @swagger
 * /listar-festivos/{year}:
 *   get:
 *     summary: Listar festivos por año
 *     description: Retorna una lista de festivos para el año especificado.
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         description: Año para el cual se desean listar los festivos.
 *         schema:
 *           type: integer
 *           format: int32
 *     responses:
 *       '200':
 *         description: Respuesta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Festivos:
 *                   type: array
 *                   description: Lista de festivos encontrados para el año especificado.
 *                   items:
 *                     type: object
 *                     properties:
 *                       Fecha:
 *                         type: string
 *                         format: date
 *                         description: Fecha del festivo en formato ISO (YYYY-MM-DD).
 *                       Nombre:
 *                         type: string
 *                         description: Nombre del festivo.
 *       '400':
 *         description: La solicitud es inválida.
 *       '404':
 *         description: No se encontraron festivos para el año especificado.
 *       '500':
 *         description: Error interno del servidor.
 */
exports.listarFestivos = async (req, res) => {
  try {
    const { year } = req.params;

    // Establecer la conexión a la base de datos
    const db = await connectToDatabase();

    // Obtener los festivos de la base de datos
    const tiposFestivos = await db.collection('tipos').find({}).toArray();

    // Array para almacenar los festivos encontrados
    let festivosEncontrados = [];

    // Iterar sobre los tipos de festivos
    for (const tipo of tiposFestivos) {
      switch (tipo.id) {
        case 1: // Festivos fijos
          for (const festivo of tipo.festivos) {
            const festivoFecha = new Date(year, festivo.mes - 1, festivo.dia);
            festivosEncontrados.push({
              Fecha: festivoFecha.toISOString().split('T')[0],
              Nombre: festivo.nombre
            });
          }
          break;
        case 2: // Festivos con traslado al siguiente lunes
          for (const festivo of tipo.festivos) {
            const festivoFecha = new Date(year, festivo.mes - 1, festivo.dia);
            // Si el festivo no cae en lunes, trasladarlo al siguiente lunes
            if (festivoFecha.getDay() !== 1) { // 1 es lunes
              festivoFecha.setDate(festivoFecha.getDate() + (8 - festivoFecha.getDay()));
            }
            festivosEncontrados.push({
              Fecha: festivoFecha.toISOString().split('T')[0],
              Nombre: festivo.nombre
            });
          }
          break;
        case 3: // Festivos de Semana Santa
          for (const festivo of tipo.festivos) {
            const fechaPascua = fechas.calcularDomingoPascua(parseInt(year));
            const fechaFestivo = fechas.agregarDias(fechaPascua, festivo.diasPascua + 7);
            festivosEncontrados.push({
              Fecha: fechaFestivo.toISOString().split('T')[0],
              Nombre: festivo.nombre
            });
          }
          break;
        case 4: // Festivos de tabla id=4
          for (const festivo of tipo.festivos) {
            const fechaPascua = fechas.calcularDomingoPascua(parseInt(year));
            const fechaFestivo = fechas.agregarDias(fechaPascua, festivo.diasPascua + 7);
            const fechaNueva = fechas.obtenerSiguienteLunes(fechaFestivo);
            festivosEncontrados.push({
              Fecha: fechaNueva,
              Nombre: festivo.nombre
            });
          }
          break;
      }
    }

    // Ordenar los festivos por fecha
    festivosEncontrados = festivosEncontrados.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));

    // Preparar la respuesta JSON
    

    res.json(festivosEncontrados);
  } catch (error) {
    console.error('Error al listar los festivos:', error);
    res.status(500).json({ error: 'Error interno del servidor', message: error.message });
  }
};

/**
 * @swagger
 * /verificar-festivo/{year}/{month}/{day}:
 *   get:
 *     summary: Verificar si una fecha es festiva
 *     description: Verifica si la fecha especificada corresponde a un día festivo y proporciona información adicional si es necesario.
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         description: Año de la fecha a verificar.
 *         schema:
 *           type: integer
 *           format: int32
 *       - in: path
 *         name: month
 *         required: true
 *         description: Mes de la fecha a verificar (número entre 1 y 12).
 *         schema:
 *           type: integer
 *           format: int32
 *       - in: path
 *         name: day
 *         required: true
 *         description: Día de la fecha a verificar (número entre 1 y 31 dependiendo del mes).
 *         schema:
 *           type: integer
 *           format: int32
 *     responses:
 *       '200':
 *         description: Respuesta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Mensaje:
 *                   type: string
 *                   description: Mensaje indicando si la fecha es festiva y el nombre del festivo si corresponde.
 *                 NuevaFecha:
 *                   type: string
 *                   format: date
 *                   description: Si la fecha es festiva y se ha calculado una nueva fecha, se proporciona aquí en formato ISO (YYYY-MM-DD).
 *       '400':
 *         description: La solicitud es inválida (por ejemplo, si la fecha especificada es inválida).
 *       '404':
 *         description: No se encontraron festivos para la fecha especificada.
 *       '500':
 *         description: Error interno del servidor.
 */
exports.verificarFestivo = async (req, res) => {
  try {
    const { year, month, day } = req.params;

    // Verificar si la fecha es válida
    const fecha = new Date(year, month - 1, day);
    if (isNaN(fecha) || fecha.getMonth() + 1 !== parseInt(month) || fecha.getDate() !== parseInt(day)) {
      return res.status(400).json({ error: 'Fecha no válida' });
    }

    // Establecer la conexión a la base de datos
    const db = await connectToDatabase();

    // Obtener los festivos de la base de datos
    const tiposFestivos = await db.collection('tipos').find({}).toArray();

    // Determinar si la fecha es festiva
    let nombreFestivo = null;
    let nuevaFecha = null;

    for (const tipo of tiposFestivos) {
      switch (tipo.id) {
        case 1: // Código para calcular los festivos fijos
          for (const festivo of tipo.festivos) {
            const festivoFecha = new Date(year, festivo.mes - 1, festivo.dia);
            if (festivoFecha.getTime() === fecha.getTime()) {
              nombreFestivo = festivo.nombre;
              break;
            }
          }
          break;
        case 2: // Código para calcular los festivos de la tabla id=2
          for (const festivo of tipo.festivos) {
            const festivoFecha = new Date(year, festivo.mes - 1, festivo.dia);
            if (festivoFecha.getTime() === fecha.getTime()) {
              nombreFestivo = festivo.nombre;
              break;
            }
          }

          if (nombreFestivo && tipo.modoCalculo === 'Se traslada la fecha al siguiente lunes') {
            const diaSemana = fecha.getDay();
            if (diaSemana !== 1) { // Si no es lunes
              nuevaFecha = fechas.obtenerSiguienteLunes(fecha);
            }
          }
          break;
        case 3: // Código para calcular los festivos de la tabla id=3
          const tiposFestivosSemanaSanta = await db.collection('tipos').findOne({ id: 3 });

          if (!tiposFestivosSemanaSanta) {
            return res.status(404).json({ error: 'No se encontraron festivos de Semana Santa en la base de datos' });
          }

          for (const festivo of tiposFestivosSemanaSanta.festivos) {
            const fechaPascua = fechas.calcularDomingoPascua(parseInt(year));
            const fechaFestivo = fechas.agregarDias(fechaPascua, festivo.diasPascua + 7);

            if (fecha.getFullYear() === fechaFestivo.getFullYear() && fecha.getMonth() === fechaFestivo.getMonth() && fecha.getDate() === fechaFestivo.getDate()) {
              nombreFestivo = festivo.nombre;
              break;
            }
          }
          break;
        case 4: // Código para calcular los festivos de la tabla id=4
          const tipoFestivoId4 = await db.collection('tipos').findOne({ id: 4 });
          if (!tipoFestivoId4) {
            return res.status(404).json({ error: 'No se encontraron festivos para el id 4' });
          }
          for (const festivo of tipoFestivoId4.festivos) {
            const fechaPascua = fechas.calcularDomingoPascua(parseInt(year));
            const fechaFestivo = fechas.agregarDias(fechaPascua, festivo.diasPascua + 7);
            const nuevaFechaCalculada = fechas.obtenerSiguienteLunes(fechaFestivo);
            console.log("Fecha calculada para " + festivo.nombre + ": " + nuevaFechaCalculada); // Console log para verificar las fechas
            // Convertir las fechas a cadenas para compararlas
            const fechaStr = fecha.toISOString().split('T')[0];
            const nuevaFechaStr = new Date(nuevaFechaCalculada).toISOString().split('T')[0];
            // Verificar si la fecha calculada coincide con la fecha proporcionada
            if (fechaStr === nuevaFechaStr) {
              nombreFestivo = festivo.nombre;
              nuevaFecha = nuevaFechaCalculada; // Asignar la nueva fecha calculada
              break;
            }
          }
          break;
      }
      if (nombreFestivo) {
        break;
      }
    }

    let mensaje = '';

    if (nombreFestivo) {
      mensaje = `¡La fecha ${year}-${month}-${day} corresponde a un día festivo (${nombreFestivo})!`;
    } else {
      mensaje = `La fecha ${year}-${month}-${day} no corresponde a un día festivo.`;
    }
    // Preparar la respuesta JSON
    const respuesta = {

      Mensaje: mensaje
    };
    // Agregar la nueva fecha si se ha calculado
    if (nombreFestivo && nuevaFecha) {
      respuesta.NuevaFecha = nuevaFecha;
    }
    res.json(respuesta);
  } catch (error) {
    console.error('Error al verificar si es festivo:', error);
    res.status(500).json({ error: 'Error interno del servidor', message: error.message });
  }
};
/**
 * @swagger
 * /semana-santa/{year}:
 *   get:
 *     summary: Obtener el inicio de Semana Santa
 *     description: Obtiene la fecha de inicio de Semana Santa para el año especificado.
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         description: Año para el cual se desea obtener el inicio de Semana Santa.
 *         schema:
 *           type: integer
 *           format: int32
 *     responses:
 *       '200':
 *         description: Respuesta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inicioSemanaSanta:
 *                   type: string
 *                   format: date
 *                   description: Fecha de inicio de Semana Santa en formato ISO (YYYY-MM-DD).
 *       '400':
 *         description: La solicitud es inválida (por ejemplo, si el año especificado no es válido).
 *       '500':
 *         description: Error interno del servidor.
 */
// Controlador para obtener la fecha de Semana Santa dado un año
exports.obtenerInicioSemanaSanta = async (req, res) => {
  try {
    const { year } = req.params;

    // Verificar si el año es válido
    if (isNaN(year) || parseInt(year) < 1000 || parseInt(year) > 9999) {
      return res.status(400).json({ error: 'Año no válido' });
    }

    // Calcular la fecha de inicio de Semana Santa utilizando la función del módulo fechas
    const inicioSemanaSanta = fechas.calcularDomingoPascua(parseInt(year));

    // Preparar la respuesta
    const respuesta = {
      inicioSemanaSanta: inicioSemanaSanta.toISOString().slice(0, 10) // Convertir la fecha a formato ISO y obtener solo la parte de la fecha (sin la hora)
    };
    res.json(respuesta);
  } catch (error) {
    console.error('Error al obtener el inicio de Semana Santa:', error);
    res.status(500).json({ error: 'Error interno del servidor', message: error.message });
  }
};