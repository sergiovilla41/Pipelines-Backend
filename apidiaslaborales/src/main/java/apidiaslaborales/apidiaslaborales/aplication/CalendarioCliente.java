package apidiaslaborales.apidiaslaborales.aplication;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import apidiaslaborales.apidiaslaborales.core.Dto.CalendarioDto;
import apidiaslaborales.apidiaslaborales.core.Dto.FestivoDto;

@Service
public class CalendarioCliente {

    @Autowired
    private RestTemplate restTemplate;

    public CalendarioDto obtenerFestivosold(int año) {
        String url = "http://express:3030/listar-festivos/" + año;
        ResponseEntity<CalendarioDto> responseEntity = restTemplate.exchange(url,
                HttpMethod.GET, null,
                new ParameterizedTypeReference<CalendarioDto>() {
                });

        return responseEntity.getBody();
    }

    public List<FestivoDto> obtenerFestivos(int year) {
        String url = "http://express:3030/listar-festivos/" + year;
        ResponseEntity<List<FestivoDto>> responseEntity = restTemplate.exchange(url, HttpMethod.GET, null,
                new ParameterizedTypeReference<List<FestivoDto>>() {
                });
        return responseEntity.getBody();

    }
}
