package apidiaslaborales.apidiaslaborales.core.service;

import java.util.List;

import apidiaslaborales.apidiaslaborales.core.Dto.CalendarioDto;
import apidiaslaborales.apidiaslaborales.core.Dto.FestivoDto;
import apidiaslaborales.apidiaslaborales.core.entities.Calendario;

public interface ICalendarioService {

    public List<Calendario> listar();

    public List<Calendario> listarPorAño(int año);

    public List<CalendarioDto> obtenerFestivos(int year);

    public Calendario agregar(Calendario calendario);

    public boolean eliminar(Long id);

    public boolean eliminarYear(int year);

    public List<FestivoDto> obtenerDiaFestivos(int year);

    public void poblarCalendario(int year);

}
