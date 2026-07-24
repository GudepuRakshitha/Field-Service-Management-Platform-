package com.meridian.keystone.dto;

import java.math.BigDecimal;

public class PartDto {
    private Long id;
    private String name;
    private String sku;
    private BigDecimal unitCost;
    private Integer stockQty;

    public PartDto() {}

    public PartDto(Long id, String name, String sku, BigDecimal unitCost, Integer stockQty) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.unitCost = unitCost;
        this.stockQty = stockQty;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }

    public Integer getStockQty() { return stockQty; }
    public void setStockQty(Integer stockQty) { this.stockQty = stockQty; }
}
