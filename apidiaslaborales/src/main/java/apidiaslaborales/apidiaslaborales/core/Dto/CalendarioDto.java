package apidiaslaborales.apidiaslaborales.core.Dto;

import java.util.Date;

import apidiaslaborales.apidiaslaborales.core.entities.Tipo;

public class CalendarioDto {
    private Long id;
    private Date fecha;
    private Tipo tipo;
    private String descripcion;

    public CalendarioDto(Date fecha, Tipo tipo, String descripcion) {

        this.fecha = fecha;
        this.tipo = tipo;
        this.descripcion = descripcion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public Tipo getTipo() {
        return tipo;
    }

    public void setTipo(Tipo tipo) {
        this.tipo = tipo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

}
