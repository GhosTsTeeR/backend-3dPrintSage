const ExcelJS = require("exceljs");
const fs = require("fs");
const officegen = require("officegen");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const PdfPrinter = require("pdfmake");
const docxConverter = require("docx-pdf");
const templatePath = path.join(__dirname, "../../assets/Plantilla.xlsx");

if (!fs.existsSync(templatePath)) {
  console.error("Template file not found:", templatePath);
  return res.status(500).json({ error: "Template file not found" });
}
exports.generateExcel = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "No se proporcionó el token" });
    }

    // Obtener los datos del estudiante (puedes obtenerlos de la base de datos o de req.body)
    const studentData = req.body.studentData;

    // Cargar la plantilla Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    // Obtener las hojas de trabajo
    const worksheet1 = workbook.getWorksheet("estudiante");
    const worksheet2 = workbook.getWorksheet("observaciones");

    if (!worksheet1 || !worksheet2) {
      console.error("One of the required worksheets is missing:", {
        worksheet1Exists: !!worksheet1,
        worksheet2Exists: !!worksheet2,
      });
      return res
        .status(500)
        .json({ error: "Required worksheet not found in the Excel template" });
    }

    // Rellenar los datos en la primera hoja
    worksheet1.getCell("C2").value = studentData.nombre;
    if (studentData.tipoDocumento == "T.I") {
      worksheet1.getCell("K2").value = "X";
    } else {
      worksheet1.getCell("I2").value = "X";
    }
    worksheet1.getCell("C3").value = studentData?.id;
    worksheet1.getCell("E4").value = studentData?.edad;
    worksheet1.getCell("E3").value = studentData?.lugarExpedicion;
    worksheet1.getCell("B4").value = studentData?.fechaEstudio;
    worksheet1.getCell("D4").value = studentData?.grado;
    worksheet1.getCell("G4").value = studentData?.fechaNacimiento;
    worksheet1.getCell("J4").value = studentData?.estado;
    worksheet1.getCell("C5").value = studentData?.nombrePadre;
    worksheet1.getCell("I5").value = studentData?.celularPadre;
    worksheet1.getCell("B6").value = studentData?.ocupacionPadre;

    worksheet1.getCell("C7").value = studentData?.nombreMadre;
    worksheet1.getCell("I7").value = studentData?.celularMadre;
    worksheet1.getCell("B8").value = studentData?.ocupacionMadre;
    worksheet1.getCell("C9").value = studentData?.acudiente;
    worksheet1.getCell("I9").value = studentData?.celularAcudiente;
    worksheet1.getCell("B10").value = studentData?.ocupacionAcudiente;

    worksheet1.getCell("C11").value = studentData?.puestoQueSolicitaCarnetSalud;
    worksheet1.getCell("F11").value = studentData?.carnetSalud;
    worksheet1.getCell("C12").value = studentData?.numeroHermanos;

    worksheet1.getCell("F12").value = studentData?.conQuienViveEstudiante;
    worksheet1.getCell("D13").value = studentData?.distanciaHogarEscuela;

    // Rellenar las observaciones en la primera hoja
    const observations = studentData.observaciones;
    console.log(observations);
    if (!Array.isArray(observations)) {
      console.error(
        "Expected observations to be an array, but got:",
        observations
      );
      return res.status(500).json({ error: "Formato de observacion invalido" });
    }

    let rowIndex = 17; // Fila inicial para las observaciones en la primera hoja
    for (const observation of observations) {
      if (rowIndex > 28) {
        // Si se superan las filas en la primera hoja, pasar a la segunda hoja
        break;
      }

      const fecha = observation.fecha;
      const observacionText = observation?.observacion;
      const seguimientoText = observation?.seguimiento;

      // Calcular el número de filas necesarias para la observación y el seguimiento
      const maxCharsPerRowObservacion = 75;
      const maxCharsPerRowSeguimiento = 37;
      const observacionRows = Math.ceil(
        observacionText.length / maxCharsPerRowObservacion
      );
      const seguimientoRows = seguimientoText
        ? Math.ceil(seguimientoText.length / maxCharsPerRowSeguimiento)
        : 1; // Mínimo 1 fila para seguimiento
      const totalRows = Math.max(observacionRows, seguimientoRows); // Máximo entre observación y seguimiento

      // Combinar las celdas para la observación y el seguimiento
      worksheet1.mergeCells(`B${rowIndex}:F${rowIndex + totalRows - 1}`);
      worksheet1.getCell(`B${rowIndex}`).value = observacionText;
      worksheet1.getCell(`B${rowIndex}`).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      worksheet1.getCell(`B${rowIndex}`).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF" },
      };
      // Combinar las celdas para el seguimiento y ajustar el texto
      worksheet1.mergeCells(`G${rowIndex}:I${rowIndex + totalRows - 1}`);

      if (seguimientoText) {
        worksheet1.getCell(`G${rowIndex}`).value = seguimientoText;
      } else {
        worksheet1.getCell(`G${rowIndex}`).value = "";
      }
      worksheet1.getCell(`G${rowIndex}`).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      worksheet1.getCell(`G${rowIndex}`).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF" },
      };

      // Ajustar las otras columnas para que ocupen el mismo número de filas
      worksheet1.mergeCells(`A${rowIndex}:A${rowIndex + totalRows - 1}`);
      worksheet1.getCell(`A${rowIndex}`).value = fecha;
      worksheet1.getCell(`A${rowIndex}`).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      worksheet1.mergeCells(`J${rowIndex}:J${rowIndex + totalRows - 1}`);
      worksheet1.mergeCells(`K${rowIndex}:K${rowIndex + totalRows - 1}`);

      rowIndex += totalRows;
    }

    // Rellenar las observaciones restantes en la segunda hoja
    let secondSheetRowIndex = 3; // Fila inicial para las observaciones en la segunda hoja
    for (
      let i = observations.length - (rowIndex - 32);
      i < observations.length;
      i++
    ) {
      const observation = observations[i];

      const fecha = observation?.fecha;
      function extractTextData(text) {
        if (typeof text === "string") {
          return text;
        }
        return "";
      }

      const observacionText = extractTextData(observation?.observacion);
      const seguimientoText = extractTextData(observation?.seguimiento);

      // Calcular el número de filas necesarias para la observación y el seguimiento
      const maxCharsPerRowObservacion = 75;
      const maxCharsPerRowSeguimiento = 37;
      const observacionRows = Math.ceil(
        observacionText.length / maxCharsPerRowObservacion
      );
      const seguimientoRows = seguimientoText
        ? Math.ceil(seguimientoText.length / maxCharsPerRowSeguimiento)
        : 1; // Mínimo 1 fila para seguimiento
      const totalRows = Math.max(observacionRows, seguimientoRows); // Máximo entre observación y seguimiento

      // Combinar las celdas para la observación y ajustar el texto
      worksheet2.mergeCells(
        `B${secondSheetRowIndex}:F${secondSheetRowIndex + totalRows - 1}`
      );
      worksheet2.getCell(`B${secondSheetRowIndex}`).value = observacionText;
      worksheet2.getCell(`B${secondSheetRowIndex}`).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      worksheet2.getCell(`B${secondSheetRowIndex}`).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF" },
      };

      // Combinar las celdas para el seguimiento y ajustar el texto
      worksheet2.mergeCells(
        `G${secondSheetRowIndex}:I${secondSheetRowIndex + totalRows - 1}`
      );
      if (seguimientoText) {
        worksheet2.getCell(`G${secondSheetRowIndex}`).value = seguimientoText;
      } else {
        worksheet2.getCell(`G${secondSheetRowIndex}`).value = "";
      }
      worksheet2.getCell(`G${secondSheetRowIndex}`).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      worksheet2.getCell(`G${secondSheetRowIndex}`).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF" },
      };

      // Ajustar las otras columnas para que ocupen el mismo número de filas
      worksheet2.mergeCells(
        `A${secondSheetRowIndex}:A${secondSheetRowIndex + totalRows - 1}`
      );
      worksheet2.getCell(`A${secondSheetRowIndex}`).value = fecha;
      worksheet2.getCell(`A${secondSheetRowIndex}`).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      worksheet2.mergeCells(
        `J${secondSheetRowIndex}:J${secondSheetRowIndex + totalRows - 1}`
      );
      worksheet2.mergeCells(
        `K${secondSheetRowIndex}:K${secondSheetRowIndex + totalRows - 1}`
      );

      secondSheetRowIndex += totalRows;
    }
    // Combinar y centrar las filas restantes sin uso en la segunda hoja
    if (secondSheetRowIndex <= 31) {
      worksheet2.mergeCells(`A${secondSheetRowIndex}:K31`);
      worksheet2.getCell(`A${secondSheetRowIndex}`).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    }
    // Obtener la fecha actual y formatearla como "DD/MM/AAAA"
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getFullYear()}`;
    // Guardar el archivo generado
    const fileName = `${studentData.nombre}-${formattedDate}.xlsx`;
    await workbook.xlsx.writeFile(fileName);

    // Enviar el archivo al cliente
    res.download(fileName, "nombre_archivo_descarga.xlsx", (err) => {
      if (err) {
        console.log("Error al enviar el archivo:", err);
      }
      // Eliminar el archivo generado después de descargarlo
      fs.unlink(fileName, (err) => {
        if (err) {
          console.log("Error al eliminar el archivo generado:", err);
        }
      });
    });
  } catch (error) {
    console.log("Error al generar el archivo Excel:", error);
    res.status(500).json({ error: "Error al generar el archivo Excel" });
  }
};
exports.generateWord = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "No se proporcionó el token" });
    }

    // Obtener los datos del estudiante (puedes obtenerlos de la base de datos o de req.body)
    const studentData = req.body.studentData;
    if (!studentData || !studentData.observaciones) {
      return res
        .status(400)
        .json({ error: "No se encontraron observaciones para el estudiante" });
    }

    // Crear un nuevo documento de Word
    let docx = officegen("docx");

    // Oficina que llama a esta función para informar errores:
    docx.on("error", function (err) {
      console.log(err);
      res.status(500).json({ error: "Error al generar el archivo de Word" });
    });

    // Crear un nuevo párrafo para el título
    let pObj = docx.createP({ align: "center" });
    pObj.addText("Información del Estudiante", { bold: true, font_size: 18 });

    // Crear una tabla para mostrar la información del estudiante
    let tableStyle = {
      tableColWidth: 4261,
      tableSize: 24,
      tableColor: "ada",
      tableAlign: "left",
      tableFontFamily: "Arial",
      borders: true,
    };

    let table = [
      [
        {
          val: "Nombre",
          opts: {
            cellColWidth: 2000,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.nombre,
          opts: {
            cellColWidth: 6000,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          val: "R.C",
          opts: {
            cellColWidth: 1500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.tipoDocumento === "R.C" ? "X" : "",
          opts: {
            cellColWidth: 1500,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          val: "T.I",
          opts: {
            cellColWidth: 1500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.tipoDocumento === "T.I" ? "X" : "",
          opts: {
            cellColWidth: 1500,
            sz: "20",
            fontFamily: "Arial",
          },
        },
      ],
      [
        {
          val: "Número de documento",
          opts: {
            cellColWidth: 3000,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.id,
          opts: {
            cellColWidth: 3000,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          val: "Lugar de expedición",
          opts: {
            cellColWidth: 3000,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.lugarExpedicion,
          opts: {
            cellColWidth: 3000,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          val: "Edad",
          opts: {
            cellColWidth: 1500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.edad,
          opts: {
            cellColWidth: 1500,
            sz: "20",
            fontFamily: "Arial",
          },
        },
      ],
      [
        {
          val: "Año",
          opts: {
            cellColWidth: 1500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.fechaEstudio,
          opts: {
            cellColWidth: 1500,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          val: "Grado",
          opts: {
            cellColWidth: 1500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.grado,
          opts: {
            cellColWidth: 1500,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          val: "Fecha de nacimiento",
          opts: {
            cellColWidth: 3000,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.fechaNacimiento,
          opts: {
            cellColWidth: 3000,
            sz: "20",
            fontFamily: "Arial",
          },
        },
      ],
      [
        {
          val: "Estado",
          opts: {
            cellColWidth: 1500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.estado,
          opts: {
            cellColWidth: 1500,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          val: "Padre del alumno",
          opts: {
            cellColWidth: 3000,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.nombrePadre,
          opts: {
            cellColWidth: 6000,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          val: "Celular",
          opts: {
            cellColWidth: 1500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.celularPadre,
          opts: {
            cellColWidth: 1500,
            sz: "20",
            fontFamily: "Arial",
          },
        },
      ],
      [
        {
          val: "Ocupación",
          opts: {
            cellColWidth: 1500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.ocupacionPadre,
          opts: {
            cellColWidth: 10500,
            sz: "20",
            fontFamily: "Arial",
            gridSpan: 3,
          },
        },
        {
          val: studentData.imagenStudent
            ? ""
            : "Imagen del estudiante no disponible",
          opts: {
            cellColWidth: 6000,
            sz: "20",
            fontFamily: "Arial",
            gridSpan: 2,
            vMerge: "restart",
            align: "center",
            valign: "center",
          },
        },
      ],
      [
        {
          val: "Madre del alumno",
          opts: {
            cellColWidth: 3000,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.nombreMadre,
          opts: {
            cellColWidth: 6000,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          val: "Celular",
          opts: {
            cellColWidth: 1500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.celularMadre,
          opts: {
            cellColWidth: 1500,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          opts: {
            vMerge: "continue",
            gridSpan: 2,
          },
        },
      ],
      [
        {
          val: "Ocupación",
          opts: {
            cellColWidth: 1500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.ocupacionMadre,
          opts: {
            cellColWidth: 13500,
            sz: "20",
            fontFamily: "Arial",
            gridSpan: 3,
          },
        },
        {
          opts: {
            vMerge: "continue",
            gridSpan: 2,
          },
        },
      ],
      [
        {
          val: "Acudiente",
          opts: {
            cellColWidth: 1500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.acudiente,
          opts: {
            cellColWidth: 7500,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          val: "Celular",
          opts: {
            cellColWidth: 1500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.celularAcudiente,
          opts: {
            cellColWidth: 1500,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          opts: {
            vMerge: "continue",
            gridSpan: 2,
          },
        },
      ],
      [
        {
          val: "Ocupación",
          opts: {
            cellColWidth: 1500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.ocupacionAcudiente,
          opts: {
            cellColWidth: 10500,
            sz: "20",
            fontFamily: "Arial",
            gridSpan: 3,
          },
        },
        {
          opts: {
            vMerge: "continue",
            gridSpan: 2,
          },
        },
      ],
      [
        {
          val: "Puesto que ocupa",
          opts: {
            cellColWidth: 3000,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.puestoQueSolicitaCarnetSalud,
          opts: {
            cellColWidth: 3000,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          val: "Carnet de salud",
          opts: {
            cellColWidth: 3000,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.carnetSalud,
          opts: {
            cellColWidth: 3000,
            sz: "20",
            fontFamily: "Arial",
            gridSpan: 3,
          },
        },
      ],
      [
        {
          val: "Nº de hermanos",
          opts: {
            cellColWidth: 3000,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.numeroHermanos,
          opts: {
            cellColWidth: 3000,
            sz: "20",
            fontFamily: "Arial",
          },
        },
        {
          val: "Con quien vive el estudiante",
          opts: {
            cellColWidth: 4500,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.conQuienViveEstudiante,
          opts: {
            cellColWidth: 4500,
            sz: "20",
            fontFamily: "Arial",
            gridSpan: 3,
          },
        },
      ],
      [
        {
          val: "Distancia que hay de la escuela al hogar",
          opts: {
            cellColWidth: 6000,
            b: true,
            sz: "20",
            shd: {
              fill: "7F7F7F",
              themeFill: "Arial",
              themeFillTint: "20",
            },
            fontFamily: "Arial",
          },
        },
        {
          val: studentData.distanciaHogarEscuela,
          opts: {
            cellColWidth: 6000,
            sz: "20",
            fontFamily: "Arial",
            gridSpan: 5,
          },
        },
      ],
    ];

    docx.createTable(table, tableStyle);

    // Crear un nuevo párrafo para el subtítulo de observaciones
    pObj = docx.createP();

    // Crear una tabla para mostrar las observaciones
    let tableHeaders = [
      {
        val: "Fecha",
        opts: {
          cellColWidth: 2000,
          b: true,
          sz: "20",
          shd: {
            fill: "7F7F7F",
            themeFill: "Arial",
            themeFillTint: "20",
          },
          fontFamily: "Arial",
        },
      },
      {
        val: "Observación",
        opts: {
          cellColWidth: 4000,
          b: true,
          sz: "20",
          shd: {
            fill: "7F7F7F",
            themeFill: "Arial",
            themeFillTint: "20",
          },
          fontFamily: "Arial",
        },
      },
      {
        val: "Seguimiento",
        opts: {
          cellColWidth: 4000,
          b: true,
          sz: "20",
          shd: {
            fill: "7F7F7F",
            themeFill: "Arial",
            themeFillTint: "20",
          },
          fontFamily: "Arial",
        },
      },
    ];

    let tableRows = studentData.observaciones.map((observation) => [
      {
        val: observation.fecha,
        opts: {
          sz: "20",
          fontFamily: "Arial",
        },
      },
      {
        val: observation.observacion,
        opts: {
          sz: "20",
          fontFamily: "Arial",
        },
      },
      {
        val: observation.seguimiento,
        opts: {
          sz: "20",
          fontFamily: "Arial",
        },
      },
    ]);

    table = [tableHeaders].concat(tableRows);

    docx.createTable(table, tableStyle);

    // Obtener la fecha actual y formatearla como "DD/MM/AAAA"
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getFullYear()}`;
    const fileName = `${studentData.nombre}-${formattedDate}.docx`;
    const filePath = path.join(__dirname, fileName);

    // Generar el documento de Word y guardarlo en el servidor
    let out = fs.createWriteStream(filePath);

    out.on("error", function (err) {
      console.log(err);
      res.status(500).json({ error: "Error al generar el archivo de Word" });
    });

    // Llamada asíncrona para generar el archivo de salida:
    docx.generate(out, {
      finalize: function (written) {
        console.log("Documento creado exitosamente");
      },
      error: function (err) {
        console.log(err);
        res.status(500).json({ error: "Error al generar el archivo de Word" });
      },
    });

    out.on("close", function () {
      // Enviar el archivo al cliente
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.log("Error al enviar el archivo:", err);
          res.status(500).json({ error: "Error al enviar el archivo" });
        } else {
          console.log("Archivo enviado exitosamente");
        }
        // Eliminar el archivo generado después de descargarlo
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log("Error al eliminar el archivo generado:", err);
          }
        });
      });
    });
  } catch (error) {
    console.log("Error al generar el archivo de Word:", error);
    res.status(500).json({ error: "Error al generar el archivo de Word" });
  }
};
exports.generatePDF = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "No se proporcionó el token" });
    }

    // Obtener el archivo Word enviado desde el frontend
    const wordBase64 = req.body.wordBase64;
    const wordBuffer = Buffer.from(wordBase64, 'base64');

    // Generar nombre de archivo único
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
    const fileName = `${formattedDate}-${Date.now()}`;

    // Guardar el archivo Word en la misma carpeta
    const wordFilePath = path.join(__dirname, `${fileName}.docx`);
    fs.writeFileSync(wordFilePath, wordBuffer);

    // Convertir el archivo Word a PDF
    const pdfFilePath = path.join(__dirname, `${fileName}.pdf`);
    await new Promise((resolve, reject) => {
      docxConverter(wordFilePath, pdfFilePath, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // Enviar el archivo PDF al cliente
    res.download(pdfFilePath, `${fileName}.pdf`, (err) => {
      if (err) {
        console.log("Error al enviar el archivo:", err);
        res.status(500).json({ error: "Error al enviar el archivo" });
      } else {
        console.log("Archivo PDF enviado exitosamente");
      }

      // Eliminar los archivos generados después de enviarlos
      try {
        if (fs.existsSync(wordFilePath)) {
          fs.unlinkSync(wordFilePath);
        }
        if (fs.existsSync(pdfFilePath)) {
          fs.unlinkSync(pdfFilePath);
        }
      } catch (error) {
        console.log("Error al eliminar los archivos generados:", error);
      }
    });
  } catch (error) {
    console.log("Error al generar el archivo PDF:", error);
    res.status(500).json({ error: "Error al generar el archivo PDF" });
  }
};