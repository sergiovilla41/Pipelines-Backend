package apidiaslaborales.apidiaslaborales.aplication;

import java.time.temporal.ChronoField;
import java.util.*;
import java.time.*;
import java.time.format.TextStyle;
import org.springframework.stereotype.Service;
import apidiaslaborales.apidiaslaborales.core.Dto.CalendarioDto;
import apidiaslaborales.apidiaslaborales.core.Dto.FestivoDto;
import apidiaslaborales.apidiaslaborales.core.entities.Calendario;
import apidiaslaborales.apidiaslaborales.core.entities.Tipo;
import apidiaslaborales.apidiaslaborales.core.repository.ICalendarioRepository;
import apidiaslaborales.apidiaslaborales.core.service.ICalendarioService;
import apidiaslaborales.apidiaslaborales.core.service.ITipoService;

@Service
public class CalendarioServicio implements ICalendarioService {
    private CalendarioCliente calendarioCliente;
    private ICalendarioRepository repository;
    private ITipoService service;

    public CalendarioServicio(CalendarioCliente calendarioCliente, ICalendarioRepository repository,
            ITipoService service) {
        this.calendarioCliente = calendarioCliente;
        this.repository = repository;
        this.service = service;

    }

    @Override
    public List<Calendario> listar() {
        return repository.findAll();
    }

    @Override
    public List<Calendario> listarPorAño(int año) {
        List<Calendario> calendarios = repository.findAll();
        List<Calendario> calendariosPorAño = new ArrayList<>();

        for (Calendario calendario : calendarios) {
            if (calendario.getYear() == año) {
                calendariosPorAño.add(calendario);
            }
        }

        return calendariosPorAño;
    }

    @Override
    public Calendario agregar(Calendario calendario) {
        calendario.setId(0);
        return repository.save(calendario);
    }

    @Override
    public boolean eliminar(Long id) {
        try {
            repository.deleteById(id);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    @Override
    public List<CalendarioDto> obtenerFestivos(int year) {
        List<CalendarioDto> festivosDto = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            CalendarioDto festivosyear = calendarioCliente.obtenerFestivosold(year);
            if (festivosDto != null) {
                festivosDto.add(festivosyear);
            }
        }
        return festivosDto;
    }

    @Override
    public List<FestivoDto> obtenerDiaFestivos(int year) {
        return calendarioCliente.obtenerFestivos(year);
    }

    @Override
    public void poblarCalendario(int year) {
        Year anio = Year.of(year); // Represent an entire year.
        List<FestivoDto> festivos = obtenerDiaFestivos(year);
        // repository.deleteAllInBatch();

        anio
                .atDay(1) // Determine the first day of the year. Returns a `LocalDate` object.
                .datesUntil( // Generates a `Stream<LocalDate>`.
                        anio
                                .plusYears(1) // Returns a new `Year` object, leaving the original unaltered.
                                .atDay(1) // Returns a `LocalDate`.
                ) // Returns a `Stream<LocalDate>`.
                .forEach((value) -> {
                    ZoneId defaultZoneId = ZoneId.systemDefault();
                    Date date = Date.from(value.atStartOfDay(defaultZoneId).toInstant());
                    repository.deleteByFecha(date);
                    String nombredia = getDayName(value, Locale.getDefault());
                    boolean esFestivo = findFestivo(value, festivos);
                    boolean esFinDeSemana = isWeekend(value);
                    Tipo tipo = esFestivo ? service.obtener(Long.valueOf(3))
                            : esFinDeSemana ? service.obtener(Long.valueOf(2))
                                    : service.obtener(Long.valueOf(1));
                    Calendario dia = new Calendario(date, tipo, nombredia);
                    agregar(dia);
                });

    }

    public static boolean isWeekend(final LocalDate ld) {
        DayOfWeek day = DayOfWeek.of(ld.get(ChronoField.DAY_OF_WEEK));
        return day == DayOfWeek.SUNDAY || day == DayOfWeek.SATURDAY;
    }

    public Date convertToDateViaSqlDate(LocalDate dateToConvert) {
        return java.sql.Date.valueOf(dateToConvert);
    }

    boolean findFestivo(LocalDate fecha, List<FestivoDto> listFestivo) {
        for (FestivoDto festivo : listFestivo) {
            Date date = convertToDateViaSqlDate(fecha);
            Date fechaFestivo = convertToDateViaSqlDate(
                    festivo.getFecha().toInstant().atZone(ZoneId.systemDefault()).toLocalDate().plusDays(1));
            if (date.equals(fechaFestivo)) {
                return true;
            }
        }
        return false;
    }

    public static String getDayName(LocalDate date, Locale locale) {
        DayOfWeek day = date.getDayOfWeek();
        return day.getDisplayName(TextStyle.FULL, locale);
    }

    @Override
    public boolean eliminarYear(int year) {
        try {
            repository.deleteAll();
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}