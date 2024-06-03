package apidiaslaborales.apidiaslaborales.core.service;

import java.util.List;

import apidiaslaborales.apidiaslaborales.core.entities.Tipo;

public interface ITipoService {

    public List<Tipo> listar();

    public Tipo obtener(Long id);

    public List<Tipo> buscar(String tipo);

}
