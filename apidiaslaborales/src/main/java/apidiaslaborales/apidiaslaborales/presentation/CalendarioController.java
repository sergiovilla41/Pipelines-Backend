package apidiaslaborales.apidiaslaborales.presentation;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import apidiaslaborales.apidiaslaborales.core.Dto.FestivoDto;
import apidiaslaborales.apidiaslaborales.core.entities.Calendario;
import apidiaslaborales.apidiaslaborales.core.service.ICalendarioService;

@RestController
@RequestMapping("/api/calendario")
public class CalendarioController {
    private ICalendarioService service;

    public CalendarioController(ICalendarioService service) {
        this.service = service;
    }

    @RequestMapping(value = "/listar", method = RequestMethod.GET)
    public List<Calendario> listar() {
        return service.listar();
    }

    @GetMapping("/listar/{year}")
    public List<Calendario> listar(@PathVariable("year") Integer año) {

        return service.listarPorAño(año);

    }

    @RequestMapping(value = "/agregar/{year}", method = RequestMethod.POST)
    public List<Calendario> agregar(@PathVariable int year) {
        service.poblarCalendario(year);
        return service.listar();
    }

    @RequestMapping(value = "/eliminar/{id}", method = RequestMethod.DELETE)
    public boolean eliminar(@PathVariable long id) {
        return service.eliminar(id);
    }

    @GetMapping("/festivos/{year}")
    public List<FestivoDto> obtenerDiaFestivos(@PathVariable("year") Integer year) {

        return service.obtenerDiaFestivos(year);
    }

}
