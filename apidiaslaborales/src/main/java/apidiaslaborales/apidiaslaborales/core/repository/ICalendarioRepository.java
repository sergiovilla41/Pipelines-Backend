package apidiaslaborales.apidiaslaborales.core.repository;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import apidiaslaborales.apidiaslaborales.core.entities.Calendario;
import jakarta.transaction.Transactional;

@Repository
public interface ICalendarioRepository extends JpaRepository<Calendario, Long> {
    @Transactional
    long deleteByFecha(Date fecha);

}
