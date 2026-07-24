package com.meridian.keystone;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meridian.keystone.domain.*;
import com.meridian.keystone.dto.*;
import com.meridian.keystone.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ApiEndpointsTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User manager;
    private User tech;
    private Customer customer;
    private Site site;
    private WorkOrder workOrder;
    private Part part;
    private String jwtToken;

    @BeforeEach
    void setUp() throws Exception {
        customer = customerRepository.save(new Customer("Apex Commercial", "apex@test.com"));
        site = siteRepository.save(new Site(customer, "HQ Tower", "100 Main St"));

        manager = userRepository.save(new User("Morgan Manager", "manager@test.com", passwordEncoder.encode("password123"), Role.MANAGER, null));
        tech = userRepository.save(new User("Alex Tech", "tech@test.com", passwordEncoder.encode("password123"), Role.TECHNICIAN, null));

        workOrder = new WorkOrder();
        workOrder.setCode("WO-API-001");
        workOrder.setTitle("API Verification Job");
        workOrder.setDescription("Testing all API endpoints");
        workOrder.setPriority(Priority.HIGH);
        workOrder.setStatus(WorkOrderStatus.NEW);
        workOrder.setCustomer(customer);
        workOrder.setSite(site);
        workOrder.setSlaDueAt(Instant.now().plusSeconds(86400));
        workOrder = workOrderRepository.save(workOrder);

        part = partRepository.save(new Part("HVAC Filter 20x20", "SKU-FILTER-01", new BigDecimal("25.50"), 100));

        // Obtain valid JWT token via /api/auth/login
        AuthRequest authReq = new AuthRequest("manager@test.com", "password123");
        String responseContent = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn().getResponse().getContentAsString();

        AuthResponse authResp = objectMapper.readValue(responseContent, AuthResponse.class);
        jwtToken = authResp.getToken();
    }

    @Test
    @DisplayName("1. Test Auth Endpoints (/api/auth/login, /api/auth/me)")
    void testAuthEndpoints() throws Exception {
        // GET /api/auth/me
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("manager@test.com"))
                .andExpect(jsonPath("$.role").value("MANAGER"));
    }

    @Test
    @DisplayName("2. Test Customer & Site Endpoints")
    void testCustomerEndpoints() throws Exception {
        // GET /api/customers
        mockMvc.perform(get("/api/customers")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        // GET /api/customers/{id}
        mockMvc.perform(get("/api/customers/" + customer.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Apex Commercial"));

        // POST /api/customers
        CustomerCreateRequest newCust = new CustomerCreateRequest("Metro Retail", "contact@metro.com");
        mockMvc.perform(post("/api/customers")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCust)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Metro Retail"));

        // GET /api/customers/{id}/sites
        mockMvc.perform(get("/api/customers/" + customer.getId() + "/sites")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("HQ Tower"));

        // POST /api/customers/{id}/sites
        SiteCreateRequest newSite = new SiteCreateRequest(customer.getId(), "Branch Office", "200 Second Ave");
        mockMvc.perform(post("/api/customers/" + customer.getId() + "/sites")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newSite)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Branch Office"));
    }

    @Test
    @DisplayName("3. Test Work Order Endpoints (CRUD, Assign, Status, History, Parts, Time)")
    void testWorkOrderEndpoints() throws Exception {
        // GET /api/work-orders
        mockMvc.perform(get("/api/work-orders")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        // GET /api/work-orders/{id}
        mockMvc.perform(get("/api/work-orders/" + workOrder.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("WO-API-001"));

        // POST /api/work-orders
        WorkOrderCreateRequest newWo = new WorkOrderCreateRequest();
        newWo.setTitle("Plumbing Repair");
        newWo.setDescription("Fix leak");
        newWo.setPriority(Priority.CRITICAL);
        newWo.setCustomerId(customer.getId());
        newWo.setSiteId(site.getId());

        String createdWoContent = mockMvc.perform(post("/api/work-orders")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newWo)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Plumbing Repair"))
                .andReturn().getResponse().getContentAsString();

        WorkOrderDto createdWo = objectMapper.readValue(createdWoContent, WorkOrderDto.class);

        // POST /api/work-orders/{id}/assign
        AssignWorkOrderRequest assignReq = new AssignWorkOrderRequest(tech.getId(), "Dispatching to Alex");
        mockMvc.perform(post("/api/work-orders/" + createdWo.getId() + "/assign")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"));

        // POST /api/work-orders/{id}/status
        StatusTransitionRequest statusReq = new StatusTransitionRequest(WorkOrderStatus.IN_PROGRESS, "Started repair");
        mockMvc.perform(post("/api/work-orders/" + createdWo.getId() + "/status")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        // GET /api/work-orders/{id}/history
        mockMvc.perform(get("/api/work-orders/" + createdWo.getId() + "/history")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // POST /api/work-orders/{id}/parts
        LogPartUsageRequest partReq = new LogPartUsageRequest(part.getId(), 2);
        mockMvc.perform(post("/api/work-orders/" + createdWo.getId() + "/parts")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(partReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.qtyUsed").value(2));

        // POST /api/work-orders/{id}/time
        LogTimeRequest timeReq = new LogTimeRequest(45, "Replaced valve assembly");
        mockMvc.perform(post("/api/work-orders/" + createdWo.getId() + "/time")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(timeReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.minutes").value(45));
    }

    @Test
    @DisplayName("4. Test Parts Inventory Endpoints (/api/parts)")
    void testPartsEndpoints() throws Exception {
        // GET /api/parts
        mockMvc.perform(get("/api/parts")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        // POST /api/parts
        PartCreateRequest newPart = new PartCreateRequest();
        newPart.setName("Copper Pipe 1/2in");
        newPart.setSku("SKU-PIPE-02");
        newPart.setUnitCost(new BigDecimal("12.00"));
        newPart.setStockQty(50);

        mockMvc.perform(post("/api/parts")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newPart)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("SKU-PIPE-02"));
    }

    @Test
    @DisplayName("5. Test Users Endpoints (/api/users, /api/users/technicians)")
    void testUserEndpoints() throws Exception {
        // GET /api/users
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // GET /api/users/technicians
        mockMvc.perform(get("/api/users/technicians")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].role").value("TECHNICIAN"));
    }

    @Test
    @DisplayName("6. Test Executive Reports Endpoint (/api/reports/summary)")
    void testReportEndpoints() throws Exception {
        mockMvc.perform(get("/api/reports/summary")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalWorkOrders").exists())
                .andExpect(jsonPath("$.slaCompliancePercent").exists());
    }

    @Test
    @DisplayName("7. Test Notifications Endpoint (/api/notifications)")
    void testNotificationEndpoints() throws Exception {
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("8. Test Photo Attachments Endpoints (/api/work-orders/{id}/attachments)")
    void testAttachmentEndpoints() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "inspection.jpg", "image/jpeg", "dummy image content".getBytes());

        // POST /api/work-orders/{id}/attachments
        String attachmentContent = mockMvc.perform(multipart("/api/work-orders/" + workOrder.getId() + "/attachments")
                        .file(file)
                        .param("attachmentType", "BEFORE")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.filename").exists())
                .andReturn().getResponse().getContentAsString();

        AttachmentDto dto = objectMapper.readValue(attachmentContent, AttachmentDto.class);

        // GET /api/work-orders/{id}/attachments
        mockMvc.perform(get("/api/work-orders/" + workOrder.getId() + "/attachments")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].filename").value(dto.getFilename()));

        // GET /api/attachments/file/{filename}
        mockMvc.perform(get("/api/attachments/file/" + dto.getFilename()))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/jpeg"));
    }
}
