package apidiaslaborales.apidiaslaborales.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import apidiaslaborales.apidiaslaborales.core.entities.Tipo;

@Repository
public interface ITipoRepository extends JpaRepository<Tipo, Long> {

}
