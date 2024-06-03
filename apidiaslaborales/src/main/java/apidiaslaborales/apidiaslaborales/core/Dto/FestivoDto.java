package apidiaslaborales.apidiaslaborales.core.Dto;

import java.util.*;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FestivoDto {
    @JsonProperty("Fecha")
    private Date fecha;

    @JsonProperty("Nombre")
    private String nombre;

    public FestivoDto(Date fecha, String nombre) {
        this.fecha = fecha;
        this.nombre = nombre;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

}
