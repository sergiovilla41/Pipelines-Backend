package apidiaslaborales.apidiaslaborales.presentation;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

import apidiaslaborales.apidiaslaborales.core.entities.Tipo;
import apidiaslaborales.apidiaslaborales.core.service.ITipoService;

import org.springframework.web.bind.annotation.RequestMethod;

@RestController
@RequestMapping("/api/tipo")
public class TipoController {
    private ITipoService service;

    public TipoController(ITipoService service) {
        this.service = service;
    }

    @RequestMapping(value = "/listar", method = RequestMethod.GET)
    public List<Tipo> listarTipos() {
        return service.listar();
    }
}
