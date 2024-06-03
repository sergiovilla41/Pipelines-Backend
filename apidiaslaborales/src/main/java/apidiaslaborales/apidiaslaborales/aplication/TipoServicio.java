package apidiaslaborales.apidiaslaborales.aplication;

import java.util.List;

import org.springframework.stereotype.Service;

import apidiaslaborales.apidiaslaborales.core.entities.Tipo;
import apidiaslaborales.apidiaslaborales.core.repository.ITipoRepository;
import apidiaslaborales.apidiaslaborales.core.service.ITipoService;

@Service
public class TipoServicio implements ITipoService {

    private ITipoRepository repository;

    public TipoServicio(ITipoRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Tipo> listar() {
        return repository.findAll();
    }

    @Override
    public Tipo obtener(Long id) {

        var tipo = repository.findById(id);
        return tipo.isEmpty() ? null : tipo.get();
    }

    @Override
    public List<Tipo> buscar(String tipo) {

        throw new UnsupportedOperationException("Unimplemented method 'buscar'");
    }

}
